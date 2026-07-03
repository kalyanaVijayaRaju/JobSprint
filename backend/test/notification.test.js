import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_notification';

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
    'users', 'jobs', 'companies', 'recruiterprofiles', 'applications', 'notifications'
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
    email: overrides.email || 'user@test.com',
    role: overrides.role || 'candidate'
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Seed helper for recruiter profile
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

// Seed helper for candidate profile
const seedCandidate = async (userId) => {
  const CandidateProfile = (await import('../src/models/CandidateProfile.js')).default;

  await CandidateProfile.create({
    userId,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    resumeUrl: 'https://s3.amazonaws.com/resumes/john_doe.pdf',
    skills: ['JavaScript', 'Node.js']
  });
};

// --- Tests ---

test('Notifications Integration Suite', async (suite) => {
  // We can group subtests inside this main test to prevent concurrent database connection closing.
  // This is a robust pattern for tests using a shared database connection.

  await suite.test('Application status transition generates a notification', async (t) => {
    await setupDatabase();
    t.after(teardownDatabase);

    const baseUrl = await startTestServer(t);

    const recruiterId = new mongoose.Types.ObjectId().toString();
    const recruiterToken = createTestToken({ id: recruiterId, role: 'recruiter', email: 'recruiter@test.com' });
    const company = await seedRecruiterWithCompany(recruiterId);

    // Create a job posting
    const Job = (await import('../src/models/Job.js')).default;
    const job = await Job.create({
      title: 'Backend Engineer',
      description: 'Role description here...',
      requirements: ['Node.js expert'],
      skillsRequired: ['Node.js'],
      locationType: 'remote',
      location: 'Worldwide',
      salaryRange: { min: 90000, max: 130000, currency: 'USD' },
      jobType: 'full-time',
      recruiterId,
      companyId: company._id,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const candidateId = new mongoose.Types.ObjectId().toString();
    const candidateToken = createTestToken({ id: candidateId, role: 'candidate', email: 'candidate@test.com' });
    await seedCandidate(candidateId);

    // Candidate applies to the job
    const Application = (await import('../src/models/Application.js')).default;
    const application = await Application.create({
      jobId: job._id,
      candidateId,
      resumeUrl: 'https://s3.amazonaws.com/resumes/john_doe.pdf',
      coverLetter: 'I am highly interested.',
      status: 'applied'
    });

    // Recruiter updates status to 'screening'
    const statusResponse = await fetch(`${baseUrl}/api/v1/applications/${application._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({ status: 'screening' })
    });

    assert.equal(statusResponse.status, 200);

    // Check if notification was created for candidate
    const listResponse = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });

    const listBody = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.equal(listBody.success, true);
    assert.equal(listBody.data.notifications.length, 1);
    assert.equal(listBody.data.notifications[0].type, 'application_status');
    assert.equal(listBody.data.notifications[0].isRead, false);
    assert.ok(listBody.data.notifications[0].message.includes('screening'));

    // Check unread count
    const countResponse = await fetch(`${baseUrl}/api/v1/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    const countBody = await countResponse.json();
    assert.equal(countResponse.status, 200);
    assert.equal(countBody.data.count, 1);

    // Candidate marks the notification as read
    const notifId = listBody.data.notifications[0]._id;
    const readResponse = await fetch(`${baseUrl}/api/v1/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    const readBody = await readResponse.json();
    assert.equal(readResponse.status, 200);
    assert.equal(readBody.data.notification.isRead, true);

    // Recruiter updates status again to 'interviewing' to generate a second notification
    const statusResponse2 = await fetch(`${baseUrl}/api/v1/applications/${application._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({ status: 'interviewing' })
    });
    assert.equal(statusResponse2.status, 200);

    // Candidate marks all as read
    const markAllResponse = await fetch(`${baseUrl}/api/v1/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    assert.equal(markAllResponse.status, 200);

    // Unread count should now be 0
    const countResponse2 = await fetch(`${baseUrl}/api/v1/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    const countBody2 = await countResponse2.json();
    assert.equal(countBody2.data.count, 0);
  });
});
