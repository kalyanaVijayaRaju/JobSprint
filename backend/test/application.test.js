import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_application';

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
    'users', 'jobs', 'companies', 'recruiterprofiles',
    'candidateprofiles', 'applications'
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

const createTestToken = async (overrides = {}) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

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
 * Seeds a CandidateProfile so a candidate can apply for jobs.
 */
const seedCandidateProfile = async (userId) => {
  const CandidateProfile = (await import('../src/models/CandidateProfile.js')).default;

  return CandidateProfile.create({
    userId,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    resumeUrl: 'https://s3.amazonaws.com/jobsprint/resumes/test_resume.pdf',
    summary: 'Experienced developer',
    skills: ['JavaScript', 'Node.js', 'React']
  });
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
      title: 'Senior Backend Engineer',
      description: 'We are looking for a senior backend engineer to join our team and build scalable services.',
      requirements: ['5+ years experience', 'MongoDB expertise'],
      skillsRequired: ['Node.js', 'Express', 'MongoDB'],
      locationType: 'hybrid',
      location: 'San Francisco, CA',
      salaryRange: { min: 120000, max: 160000, currency: 'USD' },
      jobType: 'full-time',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  const body = await response.json();
  return body.data.job;
};

const applyToJobViaApi = async (baseUrl, jobId, candidateToken) => {
  const response = await fetch(`${baseUrl}/api/v1/applications/${jobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });
  const body = await response.json();
  return body.data.application;
};

// ============================================================
// GET /api/v1/applications/summary — Role-aware dashboard totals
// ============================================================

test('GET /summary — returns authoritative candidate and recruiter pipeline totals', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter' });
  await seedRecruiterWithCompany(recruiterId);
  const firstJob = await createJobViaApi(baseUrl, recruiterToken);
  const secondJob = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  for (const job of [firstJob, secondJob]) {
    await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`
      },
      body: JSON.stringify({})
    });
  }

  const Application = (await import('../src/models/Application.js')).default;
  const screeningApplication = await Application.findOne({ jobId: firstJob._id });
  screeningApplication.status = 'screening';
  await screeningApplication.save();

  const candidateResponse = await fetch(`${baseUrl}/api/v1/applications/summary`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  const candidateBody = await candidateResponse.json();

  assert.equal(candidateResponse.status, 200);
  assert.equal(candidateBody.data.summary.total, 2);
  assert.deepEqual(candidateBody.data.summary.byStatus, {
    applied: 1,
    screening: 1,
    interviewing: 0,
    offered: 0,
    rejected: 0,
    withdrawn: 0
  });
  assert.equal(candidateBody.data.summary.totalJobs, undefined);

  const recruiterResponse = await fetch(`${baseUrl}/api/v1/applications/summary`, {
    headers: { Authorization: `Bearer ${recruiterToken}` }
  });
  const recruiterBody = await recruiterResponse.json();

  assert.equal(recruiterResponse.status, 200);
  assert.equal(recruiterBody.data.summary.total, 2);
  assert.equal(recruiterBody.data.summary.totalJobs, 2);
  assert.equal(recruiterBody.data.summary.activePipeline, 1);
  assert.equal(recruiterBody.data.summary.offerRate, 0);
});

// ============================================================
// POST /api/v1/applications/:jobId/apply — Submit Application
// ============================================================

test('POST /apply — candidate applies to a job successfully', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter with a job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Setup candidate with profile
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  // Apply
  const response = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({ coverLetter: 'I am excited to join your team!' })
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.application.status, 'applied');
  assert.equal(body.data.application.candidateId, candidateId);
  assert.equal(body.data.application.jobId, job._id);
  assert.ok(body.data.application.resumeUrl);
});

test('POST /apply — duplicate application returns 409', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  // First application
  await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });

  // Second application — should fail
  const response = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });

  const body = await response.json();

  assert.equal(response.status, 409);
  assert.equal(body.success, false);
});

test('POST /apply — recruiter cannot apply to a job (403)', async (t) => {
  const baseUrl = await startTestServer(t);
  const token = await createTestToken({ role: 'recruiter' });

  const fakeJobId = new mongoose.Types.ObjectId().toString();
  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeJobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})
  });

  assert.equal(response.status, 403);
});

test('POST /apply — unauthenticated request returns 401', async (t) => {
  const baseUrl = await startTestServer(t);
  const fakeJobId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeJobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  assert.equal(response.status, 401);
});

test('POST /apply — applying to a nonexistent job returns 404', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  const fakeJobId = new mongoose.Types.ObjectId().toString();
  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeJobId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });

  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});

// ============================================================
// GET /api/v1/applications/my-applications — Candidate Listing
// ============================================================

test('GET /my-applications — candidate sees their applications', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter + job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Setup candidate + apply
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({ coverLetter: 'Interested in this role' })
  });

  // List applications
  const response = await fetch(`${baseUrl}/api/v1/applications/my-applications`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.applications.length, 1);
  assert.equal(body.data.pagination.totalApplications, 1);
});

test('GET /my-applications — returns empty list for candidate with no applications', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const candidateToken = await createTestToken({ role: 'candidate' });

  const response = await fetch(`${baseUrl}/api/v1/applications/my-applications`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.applications.length, 0);
  assert.equal(body.data.pagination.totalApplications, 0);
});

// ============================================================
// GET /api/v1/applications/job/:jobId — Recruiter View Applicants
// ============================================================

test('GET /job/:jobId — recruiter sees applicants for their job', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter + job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Candidate applies
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });

  // Recruiter lists applicants
  const response = await fetch(`${baseUrl}/api/v1/applications/job/${job._id}`, {
    headers: { Authorization: `Bearer ${recruiterToken}` }
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.applications.length, 1);
  assert.equal(body.data.applications[0].status, 'applied');
});

test('GET /job/:jobId — non-owner recruiter gets 403', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Owner recruiter creates a job
  const ownerId = new mongoose.Types.ObjectId().toString();
  const ownerToken = await createTestToken({ id: ownerId, role: 'recruiter', email: 'owner@test.com' });
  await seedRecruiterWithCompany(ownerId);
  const job = await createJobViaApi(baseUrl, ownerToken);

  // Another recruiter tries to view applicants
  const otherId = new mongoose.Types.ObjectId().toString();
  const otherToken = await createTestToken({ id: otherId, role: 'recruiter', email: 'other@test.com' });

  const response = await fetch(`${baseUrl}/api/v1/applications/job/${job._id}`, {
    headers: { Authorization: `Bearer ${otherToken}` }
  });

  assert.equal(response.status, 403);
});

// ============================================================
// PATCH /api/v1/applications/:id/status — Update Pipeline Status
// ============================================================

test('PATCH /:id/status — recruiter updates application status', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter + job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Candidate applies
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  const applyRes = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });
  const applyBody = await applyRes.json();
  const applicationId = applyBody.data.application._id;

  // Recruiter updates status
  const response = await fetch(`${baseUrl}/api/v1/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({ status: 'screening' })
  });

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'screening');
});

test('PATCH /:id/status — candidate cannot update application status (403)', async (t) => {
  const baseUrl = await startTestServer(t);
  const candidateToken = await createTestToken({ role: 'candidate' });
  const fakeId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({ status: 'screening' })
  });

  assert.equal(response.status, 403);
});

test('PATCH /:id/status — invalid status value returns 400', async (t) => {
  const baseUrl = await startTestServer(t);
  const recruiterToken = await createTestToken({ role: 'recruiter' });
  const fakeId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({ status: 'invalid_status' })
  });

  assert.equal(response.status, 400);
});

// ============================================================
// POST /api/v1/applications/:id/notes — Add Recruiter Note
// ============================================================

test('POST /:id/notes — recruiter adds a note to an application', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  // Setup recruiter + job
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  // Candidate applies
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  const applyRes = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });
  const applyBody = await applyRes.json();
  const applicationId = applyBody.data.application._id;

  // Recruiter adds note
  const response = await fetch(`${baseUrl}/api/v1/applications/${applicationId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({ note: 'Strong candidate. Schedule technical round.' })
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.notes.length, 1);
  assert.equal(body.data.notes[0].note, 'Strong candidate. Schedule technical round.');
});

test('POST /:id/notes — empty note returns 400', async (t) => {
  const baseUrl = await startTestServer(t);
  const recruiterToken = await createTestToken({ role: 'recruiter' });
  const fakeId = new mongoose.Types.ObjectId().toString();

  const response = await fetch(`${baseUrl}/api/v1/applications/${fakeId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({ note: '' })
  });

  assert.equal(response.status, 400);
});

// ============================================================
// PATCH /api/v1/applications/:id/withdraw - Candidate Withdrawal
// ============================================================

test('PATCH /:id/withdraw - candidate withdraws their own application', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);

  const applyRes = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidateToken}`
    },
    body: JSON.stringify({})
  });
  const applyBody = await applyRes.json();
  const applicationId = applyBody.data.application._id;

  const response = await fetch(`${baseUrl}/api/v1/applications/${applicationId}/withdraw`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'withdrawn');

  const Application = (await import('../src/models/Application.js')).default;
  const application = await Application.findById(applicationId).lean();

  assert.equal(application.status, 'withdrawn');
  assert.equal(application.statusTimeline.at(-1).status, 'withdrawn');
  assert.equal(application.statusTimeline.at(-1).updatedBy.toString(), candidateId);
});

test('PATCH /:id/withdraw - candidate cannot withdraw another candidate application', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);

  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const ownerId = new mongoose.Types.ObjectId().toString();
  const ownerToken = await createTestToken({ id: ownerId, role: 'candidate', email: 'owner@test.com' });
  await seedCandidateProfile(ownerId);

  const applyRes = await fetch(`${baseUrl}/api/v1/applications/${job._id}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerToken}`
    },
    body: JSON.stringify({})
  });
  const applyBody = await applyRes.json();

  const otherCandidateToken = await createTestToken({
    id: new mongoose.Types.ObjectId().toString(),
    role: 'candidate',
    email: 'other@test.com'
  });

  const response = await fetch(`${baseUrl}/api/v1/applications/${applyBody.data.application._id}/withdraw`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${otherCandidateToken}` }
  });

  assert.equal(response.status, 404);
});

// ============================================================
// Interview scheduling lifecycle
// ============================================================

test('POST /:id/interviews — recruiter schedules an interview and candidate can view it', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);

  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);
  const application = await applyToJobViaApi(baseUrl, job._id, candidateToken);
  const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const scheduleResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` },
    body: JSON.stringify({
      scheduledAt,
      durationMinutes: 60,
      meetingType: 'video',
      meetingUrl: 'https://meet.example.com/jobsprint-interview',
      timezone: 'Asia/Kolkata',
      instructions: 'Please join five minutes early.'
    })
  });
  const scheduleBody = await scheduleResponse.json();

  assert.equal(scheduleResponse.status, 201);
  assert.equal(scheduleBody.data.interview.status, 'scheduled');
  assert.equal(scheduleBody.data.interview.meetingType, 'video');

  const Application = (await import('../src/models/Application.js')).default;
  const storedApplication = await Application.findById(application._id).lean();
  assert.equal(storedApplication.status, 'interviewing');
  assert.equal(storedApplication.statusTimeline.at(-1).status, 'interviewing');
  assert.equal(storedApplication.interviews.length, 1);

  const candidateView = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews`, {
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  const candidateBody = await candidateView.json();
  assert.equal(candidateView.status, 200);
  assert.equal(candidateBody.data.interviews.length, 1);
  assert.equal(candidateBody.data.interviews[0].instructions, 'Please join five minutes early.');

  const Notification = (await import('../src/models/Notification.js')).default;
  const notification = await Notification.findOne({ userId: candidateId, title: 'Interview Scheduled' }).lean();
  assert.ok(notification);
  assert.ok(notification.message.includes(job.title));
});

test('PATCH /:id/interviews/:interviewId — recruiter reschedules then cancels an interview', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const recruiterId = new mongoose.Types.ObjectId().toString();
  const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter' });
  await seedRecruiterWithCompany(recruiterId);
  const job = await createJobViaApi(baseUrl, recruiterToken);
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);
  const application = await applyToJobViaApi(baseUrl, job._id, candidateToken);

  const scheduleResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` },
    body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 30,
      meetingType: 'phone',
      timezone: 'UTC'
    })
  });
  const interviewId = (await scheduleResponse.json()).data.interview._id;
  const rescheduledAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

  const rescheduleResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews/${interviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` },
    body: JSON.stringify({ scheduledAt: rescheduledAt, durationMinutes: 45 })
  });
  const rescheduleBody = await rescheduleResponse.json();
  assert.equal(rescheduleResponse.status, 200);
  assert.equal(rescheduleBody.data.interview.durationMinutes, 45);
  assert.equal(new Date(rescheduleBody.data.interview.scheduledAt).toISOString(), rescheduledAt);

  const cancelResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews/${interviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` },
    body: JSON.stringify({ status: 'cancelled' })
  });
  const cancelBody = await cancelResponse.json();
  assert.equal(cancelResponse.status, 200);
  assert.equal(cancelBody.data.interview.status, 'cancelled');

  const afterCancellation = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews/${interviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` },
    body: JSON.stringify({ status: 'completed' })
  });
  assert.equal(afterCancellation.status, 400);
});

test('interview endpoints enforce recruiter ownership and scheduling validation', async (t) => {
  await setupDatabase();
  t.after(teardownDatabase);

  const baseUrl = await startTestServer(t);
  const ownerId = new mongoose.Types.ObjectId().toString();
  const ownerToken = await createTestToken({ id: ownerId, role: 'recruiter' });
  await seedRecruiterWithCompany(ownerId);
  const job = await createJobViaApi(baseUrl, ownerToken);
  const candidateId = new mongoose.Types.ObjectId().toString();
  const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });
  await seedCandidateProfile(candidateId);
  const application = await applyToJobViaApi(baseUrl, job._id, candidateToken);

  const otherRecruiterId = new mongoose.Types.ObjectId().toString();
  const otherRecruiterToken = await createTestToken({ id: otherRecruiterId, role: 'recruiter' });
  const forbiddenResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${otherRecruiterToken}` },
    body: JSON.stringify({
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 60,
      meetingType: 'onsite',
      location: 'JobSprint HQ',
      timezone: 'UTC'
    })
  });
  assert.equal(forbiddenResponse.status, 403);

  const invalidResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      scheduledAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      durationMinutes: 5,
      meetingType: 'video',
      timezone: 'UTC'
    })
  });
  assert.equal(invalidResponse.status, 400);
});
