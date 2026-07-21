/**
 * Seeds companies into the database.
 * Inserts 150+ realistic companies from the static data file.
 * Uses insertMany with ordered: false for idempotent re-runs.
 */

import Company from '../../src/models/Company.js';
import companies from './data/companies.js';
import { createProgress, printHeader } from './utils/progress.js';

const seedCompanies = async () => {
  printHeader('Seeding Companies');

  const progress = createProgress('Companies', companies.length);

  // Filter out companies that already exist
  const existingNames = await Company.find({}, 'name').lean();
  const existingNameSet = new Set(existingNames.map((c) => c.name));

  const newCompanies = companies.filter((c) => !existingNameSet.has(c.name));

  if (newCompanies.length === 0) {
    console.log(`  ⏭️  All ${companies.length} companies already exist. Skipping.`);
    progress.finish();
    return;
  }

  console.log(`  📊 Found ${existingNameSet.size} existing companies. Inserting ${newCompanies.length} new ones.`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < newCompanies.length; i += batchSize) {
    const batch = newCompanies.slice(i, i + batchSize);

    try {
      await Company.insertMany(batch, { ordered: false });
    } catch (error) {
      // Handle duplicate key errors gracefully (for idempotent runs)
      if (error.code === 11000 || error.writeErrors) {
        const inserted = error.insertedDocs?.length || batch.length - (error.writeErrors?.length || 0);
        console.log(`\n  ⚠️  Batch had ${error.writeErrors?.length || 0} duplicates, ${inserted} inserted.`);
      } else {
        throw error;
      }
    }

    progress.update(batch.length);
  }

  progress.finish();

  // Return all company IDs for downstream seeders
  const allCompanies = await Company.find({}, '_id name').lean();
  console.log(`  📦 Total companies in database: ${allCompanies.length}`);

  return allCompanies;
};

export default seedCompanies;
