import '../config/env.js';
import connectDB, { disconnectDB } from '../config/db.js';
import { expireOverdueJobs } from '../services/jobService.js';
import logger from '../utils/logger.js';

const run = async () => {
  try {
    await connectDB();
    const { expiredCount } = await expireOverdueJobs();
    logger.info(`Job expiration task completed; closed ${expiredCount} overdue posting(s).`);
  } catch (error) {
    logger.error('Job expiration task failed.', { error });
    process.exitCode = 1;
  } finally {
    await disconnectDB().catch(() => {});
  }
};

run();
