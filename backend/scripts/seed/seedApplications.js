/**
 * Seeds 10,000 job applications with realistic status pipelines.
 * Each application references existing jobs and candidates.
 * Enforces the unique compound index on {jobId, candidateId}.
 */

import Application from '../../src/models/Application.js';
import Job from '../../src/models/Job.js';
import User from '../../src/models/User.js';
import Company from '../../src/models/Company.js';
import { createProgress, printHeader } from './utils/progress.js';
import {
  randomPick,
  randomBetween,
  randomDate,
} from './utils/helpers.js';
import { coverLetterTemplates, experienceDescriptions } from './data/jobTemplates.js';

const TARGET_APPLICATION_COUNT = 10000;

/**
 * Status distribution weights:
 * 40% applied, 20% screening, 15% interviewing, 10% offered, 10% rejected, 5% withdrawn
 */
const statusPool = [];
for (let i = 0; i < 40; i++) statusPool.push('applied');
for (let i = 0; i < 20; i++) statusPool.push('screening');
for (let i = 0; i < 15; i++) statusPool.push('interviewing');
for (let i = 0; i < 10; i++) statusPool.push('offered');
for (let i = 0; i < 10; i++) statusPool.push('rejected');
for (let i = 0; i < 5; i++) statusPool.push('withdrawn');

/**
 * Status progression order for building timelines.
 */
const statusOrder = ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'];

/**
 * Builds a realistic status timeline for an application.
 */
const buildStatusTimeline = (finalStatus, appliedDate, candidateId, recruiterId) => {
  const timeline = [];
  const progressionMap = {
    'applied': ['applied'],
    'screening': ['applied', 'screening'],
    'interviewing': ['applied', 'screening', 'interviewing'],
    'offered': ['applied', 'screening', 'interviewing', 'offered'],
    'rejected': ['applied', 'screening', 'rejected'],
    'withdrawn': ['applied', 'withdrawn'],
  };

  // Some rejected candidates get further before rejection
  if (finalStatus === 'rejected' && Math.random() > 0.5) {
    progressionMap['rejected'] = ['applied', 'screening', 'interviewing', 'rejected'];
  }

  const steps = progressionMap[finalStatus] || ['applied'];
  let currentDate = new Date(appliedDate);

  for (const status of steps) {
    const updatedBy = status === 'applied' || status === 'withdrawn' ? candidateId : recruiterId;

    timeline.push({
      status,
      updatedBy,
      updatedAt: new Date(currentDate),
    });

    // Add 1-7 days between each status change
    currentDate = new Date(currentDate.getTime() + randomBetween(1, 7) * 24 * 60 * 60 * 1000);
  }

  return timeline;
};

/**
 * Generates recruiter notes for advanced-stage applications.
 */
const generateRecruiterNotes = (status, recruiterId) => {
  if (status === 'applied') return [];

  const noteTemplates = {
    'screening': [
      'Resume looks strong. Good technical background. Moving to phone screen.',
      'Relevant experience matches the JD well. Scheduling initial call.',
      'Skills align with requirements. Setting up technical assessment.',
    ],
    'interviewing': [
      'Phone screen went well. Candidate demonstrated solid fundamentals. Scheduling on-site.',
      'Technical round completed. Strong problem-solving skills observed.',
      'System design discussion showed good architectural thinking. Proceeding to final round.',
      'Coding assessment scored above threshold. Moving to manager round.',
    ],
    'offered': [
      'All rounds cleared with positive feedback. Extending offer letter.',
      'Strong candidate. Team unanimously voted to hire. Preparing compensation package.',
      'Excellent performance in all interviews. Offer approved by hiring manager.',
    ],
    'rejected': [
      'Technical skills not meeting the bar for this role. Recommend for a different position.',
      'Culture fit concerns raised during the panel interview. Decided not to proceed.',
      'Candidate did not clear the coding round. May reconsider for junior roles.',
    ],
    'withdrawn': [
      'Candidate accepted another offer. Removed from pipeline.',
      'Candidate requested to withdraw due to personal reasons.',
    ],
  };

  const notes = noteTemplates[status] || [];
  if (notes.length === 0) return [];

  // Return 1-2 notes
  const noteCount = randomBetween(1, Math.min(2, notes.length));
  const selectedNotes = [];

  for (let i = 0; i < noteCount; i++) {
    selectedNotes.push({
      note: randomPick(notes),
      createdBy: recruiterId,
      createdAt: new Date(Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000),
    });
  }

  return selectedNotes;
};

/**
 * Generates a cover letter from templates.
 */
const generateCoverLetter = (jobTitle, companyName, candidateName, skills) => {
  const template = randomPick(coverLetterTemplates);
  const experience = randomPick(experienceDescriptions);

  return template
    .replace(/\{title\}/g, jobTitle)
    .replace(/\{company\}/g, companyName)
    .replace(/\{name\}/g, candidateName)
    .replace(/\{skills\}/g, skills.slice(0, 3).join(', '))
    .replace(/\{experience\}/g, experience);
};

const seedApplications = async () => {
  printHeader('Seeding Applications');

  // Fetch all active jobs with company info
  const jobs = await Job.find({}, '_id companyId recruiterId title skillsRequired createdAt').lean();
  if (jobs.length === 0) {
    throw new Error('No jobs found. Run seedJobs first.');
  }

  // Fetch all candidate users
  const candidates = await User.find({ role: 'candidate' }, '_id email').lean();
  if (candidates.length === 0) {
    throw new Error('No candidates found. Run seedCandidates first.');
  }

  // Fetch company names for cover letters
  const companies = await Company.find({}, '_id name').lean();
  const companyNameMap = new Map(companies.map((c) => [c._id.toString(), c.name]));

  console.log(`  📊 Available: ${jobs.length} jobs, ${candidates.length} candidates`);

  // Track used pairs to enforce unique constraint
  const usedPairs = new Set();
  const applicationDocs = [];
  let attempts = 0;
  const maxAttempts = TARGET_APPLICATION_COUNT * 3; // Safety limit

  while (applicationDocs.length < TARGET_APPLICATION_COUNT && attempts < maxAttempts) {
    attempts++;

    const job = randomPick(jobs);
    const candidate = randomPick(candidates);
    const pairKey = `${job._id}_${candidate._id}`;

    // Skip if this candidate already applied to this job
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const status = randomPick(statusPool);
    const appliedDate = randomDate(
      new Date(job.createdAt),
      new Date(Math.min(Date.now(), new Date(job.createdAt).getTime() + 60 * 24 * 60 * 60 * 1000))
    );

    const companyName = companyNameMap.get(job.companyId.toString()) || 'the company';
    const candidateName = candidate.email.split('@')[0].replace(/[.\d]/g, ' ').trim();

    const coverLetter = Math.random() > 0.2 // 80% include cover letter
      ? generateCoverLetter(job.title, companyName, candidateName, job.skillsRequired)
      : undefined;

    const statusTimeline = buildStatusTimeline(status, appliedDate, candidate._id, job.recruiterId);
    const recruiterNotes = generateRecruiterNotes(status, job.recruiterId);

    applicationDocs.push({
      jobId: job._id,
      candidateId: candidate._id,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      coverLetter,
      status,
      statusTimeline,
      recruiterNotes,
      createdAt: appliedDate,
      updatedAt: statusTimeline[statusTimeline.length - 1]?.updatedAt || appliedDate,
    });
  }

  console.log(`  📊 Generated ${applicationDocs.length} unique applications in ${attempts} attempts`);

  // Insert in batches (using insertMany to bypass pre-save middleware)
  const progress = createProgress('Applications', applicationDocs.length);
  const batchSize = 500;
  let insertedCount = 0;

  for (let i = 0; i < applicationDocs.length; i += batchSize) {
    const batch = applicationDocs.slice(i, i + batchSize);
    try {
      const result = await Application.insertMany(batch, { ordered: false });
      insertedCount += result.length;
    } catch (error) {
      if (error.code === 11000 || error.writeErrors) {
        const inserted = batch.length - (error.writeErrors?.length || 0);
        insertedCount += inserted;
        console.log(`\n  ⚠️  Batch had ${error.writeErrors?.length || 0} duplicates, ${inserted} inserted.`);
      } else {
        throw error;
      }
    }
    progress.update(batch.length);
  }
  progress.finish();

  console.log(`  📦 Total applications created: ${insertedCount}`);
};

export default seedApplications;
