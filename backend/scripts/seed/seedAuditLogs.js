/**
 * Seeds realistic audit log entries.
 * Generates security activity: login, logout, password change, failed login,
 * email verification, profile update, resume upload, job posted, etc.
 */

import AuditLog from '../../src/models/AuditLog.js';
import User from '../../src/models/User.js';
import { createProgress, printHeader } from './utils/progress.js';
import {
  randomPick,
  randomBetween,
  randomDate,
  generateIPAddress,
  generateUserAgent,
} from './utils/helpers.js';

/**
 * Audit event definitions with severity and detail generators.
 */
const auditEvents = [
  {
    action: 'LOGIN_SUCCESS',
    severity: 'info',
    weight: 30,
    details: () => ({ method: 'email_password', session_duration: `${randomBetween(5, 120)}min` }),
  },
  {
    action: 'LOGOUT',
    severity: 'info',
    weight: 15,
    details: () => ({ method: 'manual', session_duration: `${randomBetween(5, 120)}min` }),
  },
  {
    action: 'LOGIN_FAILED',
    severity: 'warning',
    weight: 10,
    details: () => ({ reason: randomPick(['invalid_password', 'account_locked', 'invalid_email']), attempt_number: randomBetween(1, 5) }),
  },
  {
    action: 'PASSWORD_CHANGE',
    severity: 'info',
    weight: 5,
    details: () => ({ method: 'settings_page', password_strength: randomPick(['strong', 'very_strong']) }),
  },
  {
    action: 'EMAIL_VERIFIED',
    severity: 'info',
    weight: 8,
    details: () => ({ method: 'email_link', verification_time: `${randomBetween(1, 48)}h` }),
  },
  {
    action: 'PROFILE_UPDATED',
    severity: 'info',
    weight: 12,
    details: () => ({
      fields_updated: randomPick([
        ['firstName', 'lastName'],
        ['skills'],
        ['summary', 'skills'],
        ['phone'],
        ['experience'],
        ['education'],
        ['portfolioLinks'],
      ]),
    }),
  },
  {
    action: 'RESUME_UPLOADED',
    severity: 'info',
    weight: 6,
    details: () => ({
      file_size: `${randomBetween(100, 2048)}KB`,
      file_type: randomPick(['application/pdf', 'application/pdf', 'application/msword']),
    }),
  },
  {
    action: 'JOB_POSTED',
    severity: 'info',
    weight: 5,
    details: () => ({
      job_type: randomPick(['full-time', 'contract', 'internship']),
      location_type: randomPick(['remote', 'onsite', 'hybrid']),
    }),
  },
  {
    action: 'APPLICATION_SUBMITTED',
    severity: 'info',
    weight: 8,
    details: () => ({
      has_cover_letter: randomPick([true, true, false]),
      resume_attached: true,
    }),
  },
  {
    action: 'APPLICATION_STATUS_CHANGED',
    severity: 'info',
    weight: 5,
    details: () => ({
      from_status: randomPick(['applied', 'screening']),
      to_status: randomPick(['screening', 'interviewing', 'rejected', 'offered']),
    }),
  },
  {
    action: 'ACCOUNT_LOCKED',
    severity: 'critical',
    weight: 1,
    details: () => ({
      reason: 'too_many_failed_attempts',
      failed_attempts: randomBetween(5, 10),
      lock_duration: '30min',
    }),
  },
  {
    action: 'SUSPICIOUS_LOGIN_ATTEMPT',
    severity: 'critical',
    weight: 1,
    details: () => ({
      reason: randomPick(['new_device', 'unusual_location', 'impossible_travel']),
      risk_score: randomBetween(70, 99),
    }),
  },
];

// Build weighted pool
const eventPool = [];
for (const event of auditEvents) {
  for (let i = 0; i < event.weight; i++) {
    eventPool.push(event);
  }
}

const seedAuditLogs = async () => {
  printHeader('Seeding Audit Logs');

  const allUsers = await User.find({}, '_id role').lean();
  if (allUsers.length === 0) {
    throw new Error('No users found. Run user seeders first.');
  }

  const candidates = allUsers.filter((u) => u.role === 'candidate');
  const recruiters = allUsers.filter((u) => u.role === 'recruiter');

  const TARGET_LOG_COUNT = 5000;
  const logDocs = [];

  for (let i = 0; i < TARGET_LOG_COUNT; i++) {
    const event = randomPick(eventPool);

    // Choose user based on action type
    let user;
    if (['JOB_POSTED', 'APPLICATION_STATUS_CHANGED'].includes(event.action)) {
      user = randomPick(recruiters);
    } else if (['RESUME_UPLOADED', 'APPLICATION_SUBMITTED'].includes(event.action)) {
      user = randomPick(candidates);
    } else {
      user = randomPick(allUsers);
    }

    // Some failed logins may not have a userId
    const userId = event.action === 'LOGIN_FAILED' && Math.random() > 0.5
      ? null
      : user._id;

    logDocs.push({
      userId,
      action: event.action,
      ipAddress: generateIPAddress(),
      userAgent: generateUserAgent(),
      details: event.details(),
      severity: event.severity,
      createdAt: randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date()
      ),
    });
  }

  // Insert in batches
  const progress = createProgress('Audit Logs', logDocs.length);
  const batchSize = 1000;

  for (let i = 0; i < logDocs.length; i += batchSize) {
    const batch = logDocs.slice(i, i + batchSize);
    await AuditLog.insertMany(batch, { ordered: false });
    progress.update(batch.length);
  }
  progress.finish();

  // Print severity breakdown
  const infoCount = logDocs.filter((l) => l.severity === 'info').length;
  const warnCount = logDocs.filter((l) => l.severity === 'warning').length;
  const critCount = logDocs.filter((l) => l.severity === 'critical').length;

  console.log(`  📊 Severity breakdown: info=${infoCount}, warning=${warnCount}, critical=${critCount}`);
  console.log(`  📦 Total audit logs created: ${logDocs.length}`);
};

export default seedAuditLogs;
