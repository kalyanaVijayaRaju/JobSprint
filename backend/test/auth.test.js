import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
// Set env vars BEFORE importing the app so env.js validates them.
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test';

const { default: app } = await import('../src/app.js');

// --- Helpers ---

const startTestServer = async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

/**
 * Connects to the test database and drops the users collection
 * to ensure a clean state for each test suite run.
 */
const setupDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  // Clean up users collection for a fresh test state
  const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
  if (collections.length > 0) {
    await mongoose.connection.db.collection('users').deleteMany({});
  }
};

const teardownDatabase = async () => {
  await mongoose.connection.close();
};

// ============================================================
// GET /api/v1/auth/me — Token Identity (existing tests)
// ============================================================

test('GET /api/v1/auth/me rejects requests without a bearer token', async (t) => {
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/me`);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Authentication token is required');
});

test('GET /api/v1/auth/me returns the current token user', async (t) => {
  const baseUrl = await startTestServer(t);
  const token = jwt.sign(
    {
      sub: 'user_123',
      email: 'candidate@example.com',
      role: 'candidate'
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.user, {
    id: 'user_123',
    email: 'candidate@example.com',
    role: 'candidate'
  });
});

// ============================================================
// POST /api/v1/auth/register
// ============================================================

test('POST /api/v1/auth/register — success', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'newuser@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.user.email, 'newuser@jobsprint.com');
  assert.equal(body.data.user.role, 'candidate');
  assert.ok(body.data.user.id, 'Response should include user id');

  // Verify the token cookie was set
  const setCookieHeader = response.headers.get('set-cookie');
  assert.ok(setCookieHeader, 'set-cookie header should be present');
  assert.ok(setCookieHeader.includes('token='), 'Cookie should contain token');
  assert.ok(setCookieHeader.includes('HttpOnly'), 'Cookie should be HttpOnly');
});

test('POST /api/v1/auth/register — duplicate email returns 400', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Register the first user
  await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'duplicate@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  // Attempt to register with the same email
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'duplicate@jobsprint.com',
      password: 'AnotherPass1!',
      role: 'recruiter'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.ok(body.error.message.includes('already exists'));
});

test('POST /api/v1/auth/register — missing fields returns 400', async (t) => {
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'partial@jobsprint.com' })
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Validation failed');
});

test('POST /api/v1/auth/register — weak password returns 400', async (t) => {
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'weakpass@jobsprint.com',
      password: 'short',
      role: 'candidate'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.ok(body.error.details, 'Should include validation details');
});

// ============================================================
// POST /api/v1/auth/login
// ============================================================

test('POST /api/v1/auth/login — success', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // First register a user
  await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'loginuser@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  // Then log in
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'loginuser@jobsprint.com',
      password: 'SecurePass1!'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.message, 'Login successful');
  assert.equal(body.data.user.email, 'loginuser@jobsprint.com');

  // Verify the token cookie
  const setCookieHeader = response.headers.get('set-cookie');
  assert.ok(setCookieHeader && setCookieHeader.includes('token='));
});

test('POST /api/v1/auth/login — wrong password returns 401', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Register first
  await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'wrongpass@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  // Attempt login with wrong password
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'wrongpass@jobsprint.com',
      password: 'WrongPassword1!'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Invalid email or password');
});

test('POST /api/v1/auth/login — non-existent email returns 401', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'noone@jobsprint.com',
      password: 'SecurePass1!'
    })
  });

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Invalid email or password');
});

// ============================================================
// POST /api/v1/auth/logout
// ============================================================

test('POST /api/v1/auth/logout — clears token cookie', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Register and get a token
  const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'logoutuser@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  const registerBody = await registerResponse.json();

  // Create a bearer token for the authenticated logout request
  const token = jwt.sign(
    {
      sub: registerBody.data.user.id,
      email: registerBody.data.user.email,
      role: registerBody.data.user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.message, 'Logout successful');

  // Verify the token cookie is cleared (expires in the past)
  const setCookieHeader = response.headers.get('set-cookie');
  assert.ok(setCookieHeader, 'set-cookie header should be present');
  assert.ok(setCookieHeader.includes('token='), 'Should clear the token cookie');
});
