/**
 * Clears all seeded data from the database.
 * Drops collections in reverse dependency order.
 *
 * Usage:
 *   node scripts/seed/clear.js                      # Clear everything
 *   node scripts/seed/clear.js --only=applications,jobs   # Clear specific collections
 *   node scripts/seed/clear.js --force               # Skip confirmation prompt
 */

import { connectForSeed, disconnectAfterSeed } from './utils/connection.js';
import { printHeader } from './utils/progress.js';
import { createInterface } from 'readline';

// Import all models to ensure they're registered
import '../../src/models/User.js';
import '../../src/models/Company.js';
import '../../src/models/CandidateProfile.js';
import '../../src/models/RecruiterProfile.js';
import '../../src/models/Job.js';
import '../../src/models/Application.js';
import '../../src/models/SavedJob.js';
import '../../src/models/Notification.js';
import '../../src/models/AuditLog.js';
import '../../src/models/JobAlert.js';

import mongoose from 'mongoose';

/**
 * Collection deletion order (reverse dependency order).
 */
const collectionOrder = [
  { name: 'analytics', collection: null }, // No collection — just output files
  { name: 'auditlogs', collection: 'auditlogs' },
  { name: 'savedjobs', collection: 'savedjobs' },
  { name: 'notifications', collection: 'notifications' },
  { name: 'applications', collection: 'applications' },
  { name: 'jobs', collection: 'jobs' },
  { name: 'candidates', collection: 'candidateprofiles', also: { model: 'users', filter: { role: 'candidate' } } },
  { name: 'recruiters', collection: 'recruiterprofiles', also: { model: 'users', filter: { role: 'recruiter' } } },
  { name: 'companies', collection: 'companies' },
  { name: 'admin', collection: null, also: { model: 'users', filter: { role: 'admin' } } },
];

/**
 * Prompts for confirmation before clearing.
 */
const confirmClear = async () => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    rl.question('\n  ⚠️  This will DELETE all seeded data. Continue? (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

const parseFlags = () => {
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
  const force = process.argv.includes('--force');

  const only = onlyArg
    ? onlyArg.split('=')[1].split(',').map((n) => n.trim().toLowerCase())
    : null;

  return { only, force };
};

const main = async () => {
  printHeader('Database Clearer');

  const { only, force } = parseFlags();

  let targets = collectionOrder;
  if (only) {
    targets = collectionOrder.filter((c) => only.includes(c.name));
    console.log(`  Targeting: ${targets.map((t) => t.name).join(', ')}`);
  }

  if (!force) {
    const confirmed = await confirmClear();
    if (!confirmed) {
      console.log('  ❌ Aborted.');
      process.exit(0);
    }
  }

  try {
    await connectForSeed();
    const db = mongoose.connection.db;

    for (const target of targets) {
      // Drop the main collection
      if (target.collection) {
        try {
          const count = await db.collection(target.collection).countDocuments();
          await db.collection(target.collection).drop();
          console.log(`  🗑️  Dropped "${target.collection}" (${count.toLocaleString()} documents)`);
        } catch (error) {
          if (error.codeName === 'NamespaceNotFound') {
            console.log(`  ⏭️  "${target.collection}" does not exist. Skipping.`);
          } else {
            throw error;
          }
        }
      }

      // Handle associated data (e.g., delete candidate/recruiter users)
      if (target.also) {
        try {
          const result = await db.collection(target.also.model).deleteMany(target.also.filter);
          console.log(`  🗑️  Deleted ${result.deletedCount} documents from "${target.also.model}" where ${JSON.stringify(target.also.filter)}`);
        } catch (error) {
          console.warn(`  ⚠️  Could not clean "${target.also.model}": ${error.message}`);
        }
      }
    }

    console.log('\n  ✅ Database cleared successfully.');
  } catch (error) {
    console.error('\n❌ Error during clear:', error.message);
    process.exit(1);
  } finally {
    await disconnectAfterSeed();
  }
};

main();
