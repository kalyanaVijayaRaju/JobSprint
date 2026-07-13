import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_profile';

const { default: app } = await import('../src/app.js');

// --- Helpers ---

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
  const collectionNames = ['users', 'candidateprofiles', 'recruiterprofiles', 'companies'];
  for (const name of collectionNames) {
    const collections = await mongoose.connection.db.listCollections({ name }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.collection(name).deleteMany({});
    }
  }
};

const teardownDatabase = async () => {
  await mongoose.connection.close();
};

const createTestToken = async (overrides = {}) => {
  const User = (await import('../src/models/User.js')).default;
  const id = overrides.id || new mongoose.Types.ObjectId().toString();
  const email = overrides.email || `${overrides.role || 'candidate'}-${id}@test.com`;
  const role = overrides.role || 'candidate';

  await User.create({
    _id: id,
    email,
    passwordHash: 'SecurePass1!',
    role
  });

  const payload = {
    sub: id,
    email,
    role
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// --- Tests ---

test('Profile & Resume Integration Suite', async (suite) => {
  
  await suite.test('GET /profile — returns 404 if profile does not exist yet', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'candidate' });

    const response = await fetch(`${baseUrl}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('Profile not found'));
  });

  await suite.test('PUT /profile — upserts candidate profile successfully', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'candidate' });

    const response = await fetch(`${baseUrl}/api/v1/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Smith',
        phone: '+15555555555',
        summary: 'Experienced software developer.',
        skills: ['JavaScript', 'Node.js', 'React']
      })
    });

    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.profile.firstName, 'Alice');
    assert.equal(body.data.profile.lastName, 'Smith');
    assert.equal(body.data.profile.resumeUrl, ''); // should default to empty

    // Query profile again to verify it is retrieved
    const getResponse = await fetch(`${baseUrl}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getBody = await getResponse.json();
    assert.equal(getResponse.status, 200);
    assert.equal(getBody.data.profile.firstName, 'Alice');
  });

  await suite.test('POST /resume/upload — uploads PDF resume successfully', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'candidate' });

    // Pre-create the candidate profile
    await fetch(`${baseUrl}/api/v1/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Bob',
        lastName: 'Jones'
      })
    });

    // Perform upload
    const formData = new FormData();
    const mockPdfContent = '%PDF-1.4 dummy pdf data';
    const blob = new Blob([mockPdfContent], { type: 'application/pdf' });
    formData.append('resume', blob, 'test-resume.pdf');

    const response = await fetch(`${baseUrl}/api/v1/users/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.resumeUrl);
    assert.match(body.data.resumeUrl, /.*\/uploads\/resumes\/.*\.pdf$/);

    // Verify profile is updated with the resumeUrl
    const getResponse = await fetch(`${baseUrl}/api/v1/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getBody = await getResponse.json();
    assert.equal(getResponse.status, 200);
    assert.equal(getBody.data.profile.resumeUrl, body.data.resumeUrl);
  });

  await suite.test('POST /resume/upload — blocks invalid file types (non-PDF)', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'candidate' });

    const formData = new FormData();
    const mockTextContent = 'This is plain text content';
    const blob = new Blob([mockTextContent], { type: 'text/plain' });
    formData.append('resume', blob, 'test-resume.txt');

    const response = await fetch(`${baseUrl}/api/v1/users/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('Only PDF resumes are allowed'));
  });

  await suite.test('POST /resume/upload — blocks recruiters from uploading resumes', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'recruiter' });

    const formData = new FormData();
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    formData.append('resume', blob, 'test-resume.pdf');

    const response = await fetch(`${baseUrl}/api/v1/users/resume/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    assert.equal(response.status, 403);
  });
});
