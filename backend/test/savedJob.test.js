import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
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

const setupDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  const collectionNames = [
    'users', 'jobs', 'companies', 'recruiterprofiles', 'savedjobs'
  ];
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

const createTestToken = (overrides = {}) => {
  const payload = {
    sub: overrides.id || new mongoose.Types.ObjectId().toString(),
    email: overrides.email || 'candidate@test.com',
    role: overrides.role || 'candidate'
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

/**
 * Creates a job via the API and returns the job object.
 */
const createJobViaApi = async (baseUrl, token) => {
  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Frontend Developer',
      description: 'We are looking for a frontend developer to build amazing user interfaces.',
      requirements: ['3+ years experience'],
      skillsRequired: ['React', 'CSS', 'JavaScript'],
      locationType: 'remote',
      location: 'Worldwide',
      salaryRange: { min: 80000, max: 120000, currency: 'USD' },
      jobType: 'full-time',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  const body = await response.json();
  return body.data.job;
};

// ============================================================
// POST /api/v1/saved-jobs/:jobId — Save a Job
// ============================================================

test('POST /saved-jobs/:jobId — candidate saves a job successfully', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter with a job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Candidate saves the job
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = createTestToken({ id: candidateId, role: 'candidate' });

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.savedJob.jobId, job._id);
  assert.equal(body.data.savedJob.candidateId, candidateId);
});

test('POST /saved-jobs/:jobId — saving the same job twice is idempotent', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = createTestToken({ id: candidateId, role: 'candidate' });

  // Save once
  await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  // Save again — should succeed (idempotent)
  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
});

test('POST /saved-jobs/:jobId — saving a nonexistent job returns 404', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const candidateToken = createTestToken({ role: 'candidate' });
  const fakeJobId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${fakeJobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});

test('POST /saved-jobs/:jobId — recruiter cannot save a job (403)', async (t) => {
  const baseUrl = await startTestServer(t);
  const recruiterToken = createTestToken({ role: 'recruiter' });
  const fakeJobId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${fakeJobId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${recruiterToken}` }
  });

  assert.equal(response.status, 403);
});

test('POST /saved-jobs/:jobId — unauthenticated request returns 401', async (t) => {
  const baseUrl = await startTestServer(t);
  const fakeJobId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${fakeJobId}`, {
    method: 'POST'
  });

  assert.equal(response.status, 401);
});

// ============================================================
// DELETE /api/v1/saved-jobs/:jobId — Unsave a Job
// ============================================================

test('DELETE /saved-jobs/:jobId — candidate unsaves a job', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = createTestToken({ id: candidateId, role: 'candidate' });

  // Save first
  await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  // Unsave
  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.message, 'Job removed from saved list');
});

test('DELETE /saved-jobs/:jobId — unsaving a non-saved job returns 404', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const candidateToken = createTestToken({ role: 'candidate' });
  const fakeJobId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs/${fakeJobId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  assert.equal(response.status, 404);
});

// ============================================================
// GET /api/v1/saved-jobs — List Saved Jobs
// ============================================================

test('GET /saved-jobs — candidate lists their saved jobs', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter with a job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Candidate saves the job
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = createTestToken({ id: candidateId, role: 'candidate' });

  await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  // List saved jobs
  const response = await fetch(`${baseUrl}/api/v1/saved-jobs`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.savedJobs.length, 1);
  assert.equal(body.data.pagination.totalSavedJobs, 1);
  assert.ok(body.data.savedJobs[0].jobId); // populated job data
});

test('GET /saved-jobs — returns empty list for candidate with no saved jobs', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const candidateToken = createTestToken({ role: 'candidate' });

  const response = await fetch(`${baseUrl}/api/v1/saved-jobs`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.savedJobs.length, 0);
  assert.equal(body.data.pagination.totalSavedJobs, 0);
});

test('GET /saved-jobs — unsaved job no longer appears in the list', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = createTestToken({ id: candidateId, role: 'candidate' });

  // Save then unsave
  await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  await fetch(`${baseUrl}/api/v1/saved-jobs/${job._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  // Verify list is empty
  const response = await fetch(`${baseUrl}/api/v1/saved-jobs`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.savedJobs.length, 0);
});
