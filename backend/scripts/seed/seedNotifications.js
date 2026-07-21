/**
 * Seeds realistic notifications tied to application events and system alerts.
 * Generates notifications for candidates and recruiters.
 */

import Notification from '../../src/models/Notification.js';
import Application from '../../src/models/Application.js';
import Job from '../../src/models/Job.js';
import User from '../../src/models/User.js';
import Company from '../../src/models/Company.js';
import { createProgress, printHeader } from './utils/progress.js';
import { randomPick, randomBetween, randomDate } from './utils/helpers.js';

const seedNotifications = async () => {
  printHeader('Seeding Notifications');

  // Fetch data needed for notification generation
  const applications = await Application.find({}, 'jobId candidateId status createdAt')
    .limit(5000)
    .lean();

  const jobs = await Job.find({}, '_id title companyId').lean();
  const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));

  const companies = await Company.find({}, '_id name').lean();
  const companyMap = new Map(companies.map((c) => [c._id.toString(), c.name]));

  const candidates = await User.find({ role: 'candidate' }, '_id').lean();
  const recruiters = await User.find({ role: 'recruiter' }, '_id').lean();

  const notificationDocs = [];

  // 1. Application status notifications for candidates
  for (const app of applications) {
    const job = jobMap.get(app.jobId.toString());
    if (!job) continue;

    const companyName = companyMap.get(job.companyId.toString()) || 'the company';

    const statusNotifications = {
      'screening': {
        title: 'Application Shortlisted',
        message: `Your application for "${job.title}" at ${companyName} has been shortlisted for the screening round.`,
      },
      'interviewing': {
        title: 'Interview Scheduled',
        message: `Great news! An interview has been scheduled for your application to "${job.title}" at ${companyName}.`,
      },
      'offered': {
        title: 'Offer Received! 🎉',
        message: `Congratulations! You have received an offer for the "${job.title}" position at ${companyName}.`,
      },
      'rejected': {
        title: 'Application Update',
        message: `We regret to inform you that your application for "${job.title}" at ${companyName} was not selected. Keep exploring other opportunities!`,
      },
    };

    const notif = statusNotifications[app.status];
    if (notif) {
      notificationDocs.push({
        userId: app.candidateId,
        title: notif.title,
        message: notif.message,
        type: 'application_status',
        isRead: Math.random() > 0.4, // 60% read
        createdAt: new Date(app.createdAt.getTime() + randomBetween(1, 5) * 24 * 60 * 60 * 1000),
      });
    }
  }

  // 2. "New job matches your profile" notifications
  const matchJobs = jobs.slice(0, 500);
  for (const job of matchJobs) {
    const candidate = randomPick(candidates);
    const companyName = companyMap.get(job.companyId.toString()) || 'a company';

    notificationDocs.push({
      userId: candidate._id,
      title: 'New Job Match',
      message: `A new "${job.title}" position at ${companyName} matches your profile. Check it out!`,
      type: 'new_job',
      isRead: Math.random() > 0.5,
      createdAt: randomDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()
      ),
    });
  }

  // 3. "Recruiter viewed your profile" notifications
  for (let i = 0; i < 300; i++) {
    const candidate = randomPick(candidates);
    const company = randomPick(companies);

    notificationDocs.push({
      userId: candidate._id,
      title: 'Profile Viewed',
      message: `A recruiter from ${company.name} viewed your profile.`,
      type: 'profile_view',
      isRead: Math.random() > 0.3,
      createdAt: randomDate(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()
      ),
    });
  }

  // 4. System notifications
  const systemMessages = [
    { title: 'Complete Your Profile', message: 'Your profile is 70% complete. Add your skills and experience to increase visibility to recruiters.', target: 'candidates' },
    { title: 'Resume Update Reminder', message: 'It\'s been a while since you updated your resume. Keeping it current improves your chances!', target: 'candidates' },
    { title: 'Job Expiring Soon', message: 'A job you bookmarked is expiring in 2 days. Apply now before it\'s too late!', target: 'candidates' },
    { title: 'Weekly Job Digest', message: 'Check out this week\'s top job openings matching your skills and preferences.', target: 'candidates' },
    { title: 'Welcome to JobSprint! 🚀', message: 'Your account has been verified. Start exploring thousands of job opportunities now.', target: 'all' },
    { title: 'Platform Maintenance', message: 'Scheduled maintenance on Sunday 2:00 AM - 4:00 AM IST. The platform may be briefly unavailable.', target: 'all' },
    { title: 'New Feature: Job Alerts', message: 'Set up job alerts to get notified when new positions matching your criteria are posted.', target: 'candidates' },
  ];

  // Send system notifications to random users
  for (const msg of systemMessages) {
    const targetUsers = msg.target === 'candidates' ? candidates : [...candidates, ...recruiters];
    const recipients = targetUsers.slice(0, randomBetween(50, 200));

    for (const user of recipients) {
      notificationDocs.push({
        userId: user._id,
        title: msg.title,
        message: msg.message,
        type: 'system',
        isRead: Math.random() > 0.5,
        createdAt: randomDate(
          new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          new Date()
        ),
      });
    }
  }

  // Insert in batches
  const progress = createProgress('Notifications', notificationDocs.length);
  const batchSize = 1000;

  for (let i = 0; i < notificationDocs.length; i += batchSize) {
    const batch = notificationDocs.slice(i, i + batchSize);
    await Notification.insertMany(batch, { ordered: false });
    progress.update(batch.length);
  }
  progress.finish();

  console.log(`  📦 Total notifications created: ${notificationDocs.length}`);
};

export default seedNotifications;
