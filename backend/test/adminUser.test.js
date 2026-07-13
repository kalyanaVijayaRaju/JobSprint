import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_admin';

const { default: app } = await import('../src/app.js');

const startTestServer = async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
};

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

const createToken = (user) => jwt.sign(
  {
    sub: user._id.toString(),
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

test('GET /api/v1/admin/users lists users for admins only', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const admin = await User.create({
    email: 'admin@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'admin'
  });
  await User.create({
    email: 'candidate-list@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const baseUrl = await startTestServer(t);
  const token = createToken(admin);

  const response = await fetch(`${baseUrl}/api/v1/admin/users?role=candidate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.users.length, 1);
  assert.equal(body.data.users[0].email, 'candidate-list@jobsprint.com');
  assert.equal(body.data.users[0].passwordHash, undefined);
});

test('GET /api/v1/admin/users rejects non-admin users', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const candidate = await User.create({
    email: 'not-admin@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${createToken(candidate)}` }
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

test('PATCH /api/v1/admin/users/:id/status deactivates another user and writes an audit event', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const AuditLog = (await import('../src/models/AuditLog.js')).default;
  const admin = await User.create({
    email: 'status-admin@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'admin'
  });
  const candidate = await User.create({
    email: 'deactivate-me@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'candidate'
  });
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/admin/users/${candidate._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${createToken(admin)}`
    },
    body: JSON.stringify({
      isActive: false,
      reason: 'Suspicious activity'
    })
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.user.isActive, false);

  const updatedCandidate = await User.findById(candidate._id);
  assert.equal(updatedCandidate.isActive, false);

  const auditEvent = await AuditLog.findOne({ action: 'admin.user_deactivated' });
  assert.ok(auditEvent);
  assert.equal(auditEvent.details.targetEmail, 'deactivate-me@jobsprint.com');
});

test('PATCH /api/v1/admin/users/:id/status prevents admins from deactivating themselves', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const admin = await User.create({
    email: 'self-admin@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'admin'
  });
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/admin/users/${admin._id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${createToken(admin)}`
    },
    body: JSON.stringify({ isActive: false })
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error.message, 'Admins cannot change their own account status');
});

test('GET /api/v1/admin/audit-logs returns filtered audit logs', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const User = (await import('../src/models/User.js')).default;
  const AuditLog = (await import('../src/models/AuditLog.js')).default;
  const admin = await User.create({
    email: 'audit-admin@jobsprint.com',
    passwordHash: 'SecurePass1!',
    role: 'admin'
  });
  await AuditLog.logEvent({
    userId: admin._id,
    action: 'auth.login_success',
    severity: 'info'
  });
  await AuditLog.logEvent({
    userId: admin._id,
    action: 'auth.login_failed',
    severity: 'warning'
  });
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/admin/audit-logs?severity=warning`, {
    headers: { Authorization: `Bearer ${createToken(admin)}` }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.logs.length, 1);
  assert.equal(body.data.logs[0].action, 'auth.login_failed');
  assert.equal(body.data.logs[0].user.email, 'audit-admin@jobsprint.com');
});
