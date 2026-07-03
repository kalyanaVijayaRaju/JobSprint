import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_job';

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
  // Clean up test collections
  const collectionNames = ['users', 'jobs', 'companies', 'recruiterprofiles'];
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

/**
 * Creates a test user and returns a bearer token for them.
 */
const createTestToken = (overrides = {}) => {
  const payload = {
    sub: overrides.id || new mongoose.Types.ObjectId().toString(),
    email: overrides.email || 'recruiter@test.com',
    role: overrides.role || 'recruiter'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Seeds a Company and RecruiterProfile so a recruiter can create jobs.
 */
const seedRecruiterWithCompany = async (userId) => {
  const Company = (await import('../src/models/Company.js')).default;
  const RecruiterProfile = (await import('../src/models/RecruiterProfile.js')).default;

  const company = await Company.create({
    name: `TestCorp-${Date.now()}`,
    description: 'A test company for integration tests',
    industry: 'Technology',
    size: '11-50',
    locations: ['San Francisco, CA']
  });

  await RecruiterProfile.create({
    userId,
    companyId: company._id,
    jobTitle: 'Hiring Manager'
  });

  return company;
};

const validJobPayload = {
  title: 'Senior Backend Engineer',
  description: 'We are looking for a senior backend engineer to join our team and build scalable services.',
  requirements: ['5+ years experience', 'MongoDB expertise'],
  skillsRequired: ['Node.js', 'Express', 'MongoDB'],
  locationType: 'hybrid',
  location: 'San Francisco, CA',
  salaryRange: { min: 120000, max: 160000, currency: 'USD' },
  jobType: 'full-time',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

// ============================================================
// POST /api/v1/jobs — Create Job
// ============================================================

test('POST /api/v1/jobs — recruiter creates a job successfully', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const token = createTestToken({ id: recruiterId });
  await seedRecruiterWithCompany(recruiterId);

  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.job.title, validJobPayload.title);
  assert.equal(body.data.job.status, 'active');
  assert.equal(body.data.job.recruiterId, recruiterId);
});

test('POST /api/v1/jobs — candidate cannot create a job (403)', async (t) => {
  const baseUrl = await startTestServer(t);
  const token = createTestToken({ role: 'candidate' });

  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });

  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

test('POST /api/v1/jobs — unauthenticated request returns 401', async (t) => {
  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validJobPayload)
  });

  assert.equal(response.status, 401);
});

test('POST /api/v1/jobs — missing required fields returns 400', async (t) => {
  const baseUrl = await startTestServer(t);
  const token = createTestToken();

  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: 'Incomplete Job' })
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
});

// ============================================================
// GET /api/v1/jobs — List Jobs
// ============================================================

test('GET /api/v1/jobs — returns empty paginated result', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const response = await fetch(`${baseUrl}/api/v1/jobs`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.jobs));
  assert.ok(body.data.pagination);
  assert.equal(body.data.pagination.currentPage, 1);
});

test('GET /api/v1/jobs — returns created jobs', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const token = createTestToken({ id: recruiterId });
  await seedRecruiterWithCompany(recruiterId);

  // Create a job first
  await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });

  const response = await fetch(`${baseUrl}/api/v1/jobs`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.jobs.length, 1);
  assert.equal(body.data.jobs[0].title, validJobPayload.title);
  assert.equal(body.data.pagination.totalJobs, 1);
});

// ============================================================
// GET /api/v1/jobs/:id — Get Single Job
// ============================================================

test('GET /api/v1/jobs/:id — returns a single job by ID', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const token = createTestToken({ id: recruiterId });
  await seedRecruiterWithCompany(recruiterId);

  // Create a job
  const createRes = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });
  const createBody = await createRes.json();
  const jobId = createBody.data.job._id;

  // Get the job
  const response = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.job._id, jobId);
  assert.equal(body.data.job.title, validJobPayload.title);
});

test('GET /api/v1/jobs/:id — returns 404 for nonexistent job', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const fakeId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/jobs/${fakeId}`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});

// ============================================================
// PUT /api/v1/jobs/:id — Update Job
// ============================================================

test('PUT /api/v1/jobs/:id — owner can update their job', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const token = createTestToken({ id: recruiterId });
  await seedRecruiterWithCompany(recruiterId);

  // Create a job
  const createRes = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });
  const createBody = await createRes.json();
  const jobId = createBody.data.job._id;

  // Update the job
  const response = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'closed' })
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.job.status, 'closed');
});

test('PUT /api/v1/jobs/:id — non-owner gets 403', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const ownerId = new mongoose.Types.ObjectId().toString();
  const ownerToken = createTestToken({ id: ownerId });
  await seedRecruiterWithCompany(ownerId);

  // Create a job as owner
  const createRes = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerToken}`
    },
    body: JSON.stringify(validJobPayload)
  });
  const createBody = await createRes.json();
  const jobId = createBody.data.job._id;

  // Another recruiter tries to update
  const otherToken = createTestToken({
    id: new mongoose.Types.ObjectId().toString(),
    email: 'other@test.com'
  });

  const response = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otherToken}`
    },
    body: JSON.stringify({ status: 'closed' })
  });

  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.success, false);
});

// ============================================================
// DELETE /api/v1/jobs/:id — Soft Delete (Archive)
// ============================================================

test('DELETE /api/v1/jobs/:id — owner can archive their job', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const token = createTestToken({ id: recruiterId });
  await seedRecruiterWithCompany(recruiterId);

  // Create a job
  const createRes = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(validJobPayload)
  });
  const createBody = await createRes.json();
  const jobId = createBody.data.job._id;

  // Delete (archive) the job
  const response = await fetch(`${baseUrl}/api/v1/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.message, 'Job archived successfully');

  // Verify it no longer appears in active listings
  const listRes = await fetch(`${baseUrl}/api/v1/jobs`);
  const listBody = await listRes.json();
  assert.equal(listBody.data.jobs.length, 0);
});
