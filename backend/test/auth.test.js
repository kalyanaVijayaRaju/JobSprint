import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
// Set env vars BEFORE importing the app so env.js validates them.
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_auth';

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
 * Connects to the test database and drops auth-related collections
 * to ensure a clean state for each test suite run.
 */
const setupDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  for (const collectionName of ['users', 'auditlogs']) {
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection(collectionName).deleteMany({});
    }
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
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const user = await User.create({
    email: 'candidate@example.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const baseUrl = await startTestServer(t);
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
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
    id: user._id.toString(),
    email: 'candidate@example.com',
    role: 'candidate'
  });
});

test('GET /api/v1/auth/me accepts the token from an HttpOnly cookie', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const user = await User.create({
    email: 'cookie-user@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'recruiter'
  });
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      Cookie: `token=${token}`
    }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.user, {
    id: user._id.toString(),
    email: 'cookie-user@jobsprint.com',
    role: 'recruiter'
  });
});

test('GET /api/v1/auth/me prefers bearer token when cookie is also present', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const bearerUser = await User.create({
    email: 'bearer-user@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const cookieUser = await User.create({
    email: 'cookie-fallback@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'recruiter'
  });
  const bearerToken = jwt.sign(
    {
      sub: bearerUser._id.toString(),
      email: bearerUser.email,
      role: bearerUser.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const cookieToken = jwt.sign(
    {
      sub: cookieUser._id.toString(),
      email: cookieUser.email,
      role: cookieUser.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      Cookie: `token=${cookieToken}`
    }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.user, {
    id: bearerUser._id.toString(),
    email: 'bearer-user@jobsprint.com',
    role: 'candidate'
  });
});

test('GET /api/v1/auth/me rejects a valid token for a deleted user', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const token = jwt.sign(
    {
      sub: new mongoose.Types.ObjectId().toString(),
      email: 'deleted@jobsprint.com',
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

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.message, 'Authentication user no longer exists');
});

test('GET /api/v1/auth/me rejects inactive users', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const user = await User.create({
    email: 'inactive@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate',
    isActive: false
  });
  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.message, 'This account has been deactivated');
});

test('GET /api/v1/auth/me rejects tokens issued before a password change', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const user = await User.create({
    email: 'stale-token@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate',
    passwordChangedAt: new Date()
  });
  const staleToken = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000) - 60
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${staleToken}` }
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error.message, 'Authentication token is no longer valid. Please log in again.');
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

test('POST /api/v1/auth/login tracks failed attempts and locks the account', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const User = (await import('../src/models/User.js')).default;
  await User.create({
    email: 'lockout@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });

  const loginWithWrongPassword = () => fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'lockout@jobsprint.com',
      password: 'WrongPassword1!'
    })
  });

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await loginWithWrongPassword();
    assert.equal(response.status, 401);
  }

  const lockedUser = await User.findByEmail('lockout@jobsprint.com');
  assert.equal(lockedUser.failedLoginAttempts, 5);
  assert.ok(lockedUser.lockUntil > new Date());

  const lockedResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'lockout@jobsprint.com',
      password: 'SecurePass1!'
    })
  });
  const lockedBody = await lockedResponse.json();

  assert.equal(lockedResponse.status, 423);
  assert.equal(lockedBody.error.message, 'Account is temporarily locked. Please try again later.');
});

test('POST /api/v1/auth/login resets failed attempts after a successful login', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const User = (await import('../src/models/User.js')).default;
  await User.create({
    email: 'reset-attempts@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate',
    failedLoginAttempts: 2
  });

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'reset-attempts@jobsprint.com',
      password: 'SecurePass1!'
    })
  });

  assert.equal(response.status, 200);

  const user = await User.findByEmail('reset-attempts@jobsprint.com');
  assert.equal(user.failedLoginAttempts, 0);
  assert.equal(user.lockUntil, undefined);
  assert.ok(user.lastLoginAt);
});

test('POST /api/v1/auth/login rejects inactive accounts', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const User = (await import('../src/models/User.js')).default;
  await User.create({
    email: 'inactive-login@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate',
    isActive: false
  });

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'inactive-login@jobsprint.com',
      password: 'SecurePass1!'
    })
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.error.message, 'This account has been deactivated');
});

test('GET /api/v1/auth/security/activity returns the current user audit events', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'activity@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });

  const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'activity@jobsprint.com',
      password: 'SecurePass1!'
    })
  });
  const cookie = loginResponse.headers.get('set-cookie');

  const response = await fetch(`${baseUrl}/api/v1/auth/security/activity`, {
    headers: { Cookie: cookie }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.events.some((event) => event.action === 'auth.login_success'));
  assert.equal(body.data.pagination.page, 1);
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

test('PATCH /api/v1/auth/password — changes password and invalidates old credentials', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'password-change@jobsprint.com',
      password: 'SecurePass1!',
      role: 'candidate'
    })
  });
  const { data } = await registerResponse.json();
  const token = jwt.sign(
    {
      sub: data.user.id,
      email: data.user.email,
      role: data.user.role,
      iat: Math.floor(Date.now() / 1000) - 60
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const response = await fetch(`${baseUrl}/api/v1/auth/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currentPassword: 'SecurePass1!',
      newPassword: 'StrongerPass2!'
    })
  });
  assert.equal(response.status, 200);

  const login = (password) => fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: data.user.email, password })
  });

  assert.equal((await login('SecurePass1!')).status, 401);
  assert.equal((await login('StrongerPass2!')).status, 200);

  const staleSessionResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const staleSessionBody = await staleSessionResponse.json();

  assert.equal(staleSessionResponse.status, 401);
  assert.equal(staleSessionBody.error.message, 'Authentication token is no longer valid. Please log in again.');
});

test('PATCH /api/v1/auth/password — rejects an incorrect current password', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const user = await User.create({
    email: 'wrong-current@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/auth/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currentPassword: 'NotThePassword1!',
      newPassword: 'StrongerPass2!'
    })
  });

  assert.equal(response.status, 401);
});
