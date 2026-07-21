/**
 * Master seed orchestrator.
 * Runs all seeders in the correct dependency order.
 *
 * Usage:
 *   node scripts/seed/index.js              # Seed everything
 *   node scripts/seed/index.js --only=companies,jobs   # Seed specific entities
 */

import { connectForSeed, disconnectAfterSeed } from './utils/connection.js';
import { printSummary } from './utils/progress.js';

import seedAdmin from './seedAdmin.js';
import seedCompanies from './seedCompanies.js';
import seedRecruiters from './seedRecruiters.js';
import seedCandidates from './seedCandidates.js';
import seedJobs from './seedJobs.js';
import seedApplications from './seedApplications.js';
import seedNotifications from './seedNotifications.js';
import seedSavedJobs from './seedSavedJobs.js';
import seedAuditLogs from './seedAuditLogs.js';
import seedAnalytics from './seedAnalytics.js';

/**
 * Seeder registry — defines execution order and dependencies.
 */
const seeders = [
  { name: 'admin', fn: seedAdmin, deps: [] },
  { name: 'companies', fn: seedCompanies, deps: [] },
  { name: 'recruiters', fn: seedRecruiters, deps: ['companies'] },
  { name: 'candidates', fn: seedCandidates, deps: [] },
  { name: 'jobs', fn: seedJobs, deps: ['companies', 'recruiters'] },
  { name: 'applications', fn: seedApplications, deps: ['jobs', 'candidates'] },
  { name: 'notifications', fn: seedNotifications, deps: ['applications'] },
  { name: 'savedjobs', fn: seedSavedJobs, deps: ['jobs', 'candidates'] },
  { name: 'auditlogs', fn: seedAuditLogs, deps: ['admin', 'candidates', 'recruiters'] },
  { name: 'analytics', fn: seedAnalytics, deps: ['applications'] },
];

/**
 * Parses the --only=... CLI flag.
 * @returns {string[] | null} List of seeder names to run, or null for all
 */
const parseOnlyFlag = () => {
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
  if (!onlyArg) return null;

  const names = onlyArg.split('=')[1].split(',').map((n) => n.trim().toLowerCase());
  return names;
};

/**
 * Resolves which seeders to run based on --only flag and dependencies.
 */
const resolveSeeders = (onlyNames) => {
  if (!onlyNames) return seeders;

  // Validate names
  const validNames = new Set(seeders.map((s) => s.name));
  for (const name of onlyNames) {
    if (!validNames.has(name)) {
      console.error(`❌ Unknown seeder: "${name}". Valid options: ${[...validNames].join(', ')}`);
      process.exit(1);
    }
  }

  // Include requested seeders and their dependencies (transitive)
  const required = new Set();
  const addWithDeps = (name) => {
    if (required.has(name)) return;
    required.add(name);
    const seeder = seeders.find((s) => s.name === name);
    if (seeder) {
      for (const dep of seeder.deps) {
        addWithDeps(dep);
      }
    }
  };

  for (const name of onlyNames) {
    addWithDeps(name);
  }

  // Return seeders in correct order
  return seeders.filter((s) => required.has(s.name));
};

const main = async () => {
  const startTime = Date.now();

  console.log('\n' + '═'.repeat(50));
  console.log('  🌱 JobSprint Database Seeder');
  console.log('═'.repeat(50));

  const onlyNames = parseOnlyFlag();
  const selectedSeeders = resolveSeeders(onlyNames);

  if (onlyNames) {
    console.log(`\n  Running selected seeders: ${selectedSeeders.map((s) => s.name).join(', ')}`);
  } else {
    console.log('\n  Running ALL seeders...');
  }

  try {
    await connectForSeed();

    for (const seeder of selectedSeeders) {
      try {
        await seeder.fn();
      } catch (error) {
        console.error(`\n❌ Error in "${seeder.name}" seeder:`, error.message);
        console.error(error.stack);
        process.exit(1);
      }
    }

    printSummary(startTime);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectAfterSeed();
  }
};

main();
