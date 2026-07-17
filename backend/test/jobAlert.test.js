import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// --- Test environment setup ---
process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-thirty-two-chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsprint_test_jobalert';

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
    'users', 'jobs', 'companies', 'recruiterprofiles', 'jobalerts', 'notifications'
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

const seedRecruiterWithCompany = async (userId) => {
  const Company = (await import('../src/models/Company.js')).default;
  const RecruiterProfile = (await import('../src/models/RecruiterProfile.js')).default;

  const company = await Company.create({
    name: `TestCorp-${Date.now()}`,
    description: 'A test company for alerts tests',
    industry: 'Technology',
    size: '11-50',
    locations: ['New York, NY']
  });

  await RecruiterProfile.create({
    userId,
    companyId: company._id,
    jobTitle: 'Hiring Lead'
  });

  return company;
};

// --- Test Suites ---

test.describe('Job Alerts API Integration', () => {
  test.beforeEach(async () => {
    await setupDatabase();
  });

  test.after(async () => {
    await teardownDatabase();
  });

  test('POST /job-alerts — candidate creates alert successfully', async (t) => {
    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'candidate' });

    const payload = {
      keyword: 'react',
      locationType: 'remote',
      jobType: 'full-time',
      minSalary: 80000
    };

    const response = await fetch(`${baseUrl}/api/v1/job-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data.alert.keyword, 'react');
    assert.equal(body.data.alert.locationType, 'remote');
    assert.equal(body.data.alert.jobType, 'full-time');
    assert.equal(body.data.alert.minSalary, 80000);
  });

  test('POST /job-alerts — rejects recruiter from creating alerts', async (t) => {
    const baseUrl = await startTestServer(t);
    const token = await createTestToken({ role: 'recruiter' });

    const response = await fetch(`${baseUrl}/api/v1/job-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ keyword: 'node' })
    });

    assert.equal(response.status, 403);
  });

  test('GET /job-alerts — candidate lists active alerts', async (t) => {
    const baseUrl = await startTestServer(t);
    const candidateId = new mongoose.Types.ObjectId().toString();
    const token = await createTestToken({ id: candidateId, role: 'candidate' });

    const JobAlert = (await import('../src/models/JobAlert.js')).default;
    await JobAlert.create({
      userId: candidateId,
      keyword: 'vue',
      locationType: 'hybrid',
      jobType: 'contract'
    });

    const response = await fetch(`${baseUrl}/api/v1/job-alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data.alerts.length, 1);
    assert.equal(body.data.alerts[0].keyword, 'vue');
  });

  test('DELETE /job-alerts/:id — candidate deletes their alert', async (t) => {
    const baseUrl = await startTestServer(t);
    const candidateId = new mongoose.Types.ObjectId().toString();
    const token = await createTestToken({ id: candidateId, role: 'candidate' });

    const JobAlert = (await import('../src/models/JobAlert.js')).default;
    const alert = await JobAlert.create({
      userId: candidateId,
      keyword: 'angular'
    });

    const response = await fetch(`${baseUrl}/api/v1/job-alerts/${alert._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    assert.equal(response.status, 200);
    const verifyDel = await JobAlert.findById(alert._id);
    assert.equal(verifyDel, null);
  });

  test('Automated Dispatch — notifies matching candidate when recruiter publishes new job', async (t) => {
    const baseUrl = await startTestServer(t);
    
    // Seed candidate and alert
    const candidateId = new mongoose.Types.ObjectId().toString();
    const candidateEmail = 'alert-seeker@test.com';
    const candidateToken = await createTestToken({ id: candidateId, email: candidateEmail, role: 'candidate' });

    const JobAlert = (await import('../src/models/JobAlert.js')).default;
    await JobAlert.create({
      userId: candidateId,
      keyword: 'typescript',
      locationType: 'remote',
      jobType: 'full-time',
      minSalary: 100000
    });

    // Seed recruiter and company
    const recruiterId = new mongoose.Types.ObjectId().toString();
    const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter' });
    await seedRecruiterWithCompany(recruiterId);

    // Recruiter posts matching job
    const jobPayload = {
      title: 'Senior TypeScript Architect',
      description: 'Building next gen platforms with node and typescript',
      locationType: 'remote',
      location: 'New York, NY',
      salaryRange: { min: 110000, max: 150000, currency: 'USD' },
      jobType: 'full-time',
      skillsRequired: ['typescript', 'node'],
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString()
    };

    const postJobResponse = await fetch(`${baseUrl}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify(jobPayload)
    });

    assert.equal(postJobResponse.status, 201);

    // Wait a brief tick for async alert dispatching
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check candidate notifications
    const Notification = (await import('../src/models/Notification.js')).default;
    const notifications = await Notification.find({ userId: candidateId });
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].type, 'new_job');
    assert.ok(notifications[0].title.includes('New Job Match'));
    assert.ok(notifications[0].message.includes('Senior TypeScript Architect'));
  });

  test('Automated Dispatch — does NOT notify mismatching candidate', async (t) => {
    const baseUrl = await startTestServer(t);
    
    // Seed candidate and alert (demanding onsite angular role)
    const candidateId = new mongoose.Types.ObjectId().toString();
    const candidateToken = await createTestToken({ id: candidateId, role: 'candidate' });

    const JobAlert = (await import('../src/models/JobAlert.js')).default;
    await JobAlert.create({
      userId: candidateId,
      keyword: 'angular',
      locationType: 'onsite'
    });

    // Seed recruiter
    const recruiterId = new mongoose.Types.ObjectId().toString();
    const recruiterToken = await createTestToken({ id: recruiterId, role: 'recruiter' });
    await seedRecruiterWithCompany(recruiterId);

    // Recruiter posts remote typescript job
    const jobPayload = {
      title: 'Remote Senior React Developer',
      description: 'Developing UI features with React',
      locationType: 'remote',
      location: 'San Francisco, CA',
      salaryRange: { min: 90000, max: 120000, currency: 'USD' },
      jobType: 'full-time',
      skillsRequired: ['react'],
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString()
    };

    const postJobResponse = await fetch(`${baseUrl}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`
      },
      body: JSON.stringify(jobPayload)
    });

    assert.equal(postJobResponse.status, 201);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const Notification = (await import('../src/models/Notification.js')).default;
    const notifications = await Notification.find({ userId: candidateId });
    assert.equal(notifications.length, 0);
  });
});
