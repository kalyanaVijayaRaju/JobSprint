/**
 * Seeds saved/bookmarked jobs for candidates.
 * Each candidate saves 1-8 jobs (weighted toward 2-4).
 * Enforces the unique compound index on {candidateId, jobId}.
 */

import SavedJob from '../../src/models/SavedJob.js';
import Job from '../../src/models/Job.js';
import User from '../../src/models/User.js';
import { createProgress, printHeader } from './utils/progress.js';
import { randomPick, randomPicks, randomBetween, randomDate } from './utils/helpers.js';

const seedSavedJobs = async () => {
  printHeader('Seeding Saved Jobs');

  const candidates = await User.find({ role: 'candidate' }, '_id').lean();
  const jobs = await Job.find({ status: 'active' }, '_id createdAt').lean();

  if (candidates.length === 0 || jobs.length === 0) {
    throw new Error('Candidates or jobs not found. Run previous seeders first.');
  }

  console.log(`  📊 Available: ${candidates.length} candidates, ${jobs.length} active jobs`);

  const savedJobDocs = [];
  const usedPairs = new Set();

  for (const candidate of candidates) {
    // Each candidate saves 1-8 jobs (weighted toward 2-4)
    const saveCount = randomPick([1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8]);
    const selectedJobs = randomPicks(jobs, saveCount);

    for (const job of selectedJobs) {
      const pairKey = `${candidate._id}_${job._id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      savedJobDocs.push({
        candidateId: candidate._id,
        jobId: job._id,
        createdAt: randomDate(
          new Date(job.createdAt),
          new Date()
        ),
      });
    }
  }

  // Insert in batches
  const progress = createProgress('Saved Jobs', savedJobDocs.length);
  const batchSize = 1000;

  for (let i = 0; i < savedJobDocs.length; i += batchSize) {
    const batch = savedJobDocs.slice(i, i + batchSize);
    try {
      await SavedJob.insertMany(batch, { ordered: false });
    } catch (error) {
      if (error.code === 11000 || error.writeErrors) {
        // Duplicates are expected and safe to ignore
      } else {
        throw error;
      }
    }
    progress.update(batch.length);
  }
  progress.finish();

  const totalCount = await SavedJob.countDocuments();
  console.log(`  📦 Total saved jobs in database: ${totalCount}`);
};

export default seedSavedJobs;
