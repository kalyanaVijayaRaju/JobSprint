import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';

const { default: app } = await import('../src/app.js');

const startTestServer = async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

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
