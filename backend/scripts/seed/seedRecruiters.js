/**
 * Seeds recruiter users and their profiles.
 * Creates 300 recruiter User documents + 300 RecruiterProfile documents.
 * Distributes recruiters across companies based on company size.
 */

import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';
import RecruiterProfile from '../../src/models/RecruiterProfile.js';
import Company from '../../src/models/Company.js';
import { createProgress, printHeader } from './utils/progress.js';
import {
  randomPick,
  randomBetween,
  generatePhone,
  generateLinkedIn,
  generateProfilePhoto,
  generateEmail,
} from './utils/helpers.js';
import {
  firstNamesMale,
  firstNamesFemale,
  lastNames,
  recruiterDesignations,
  recruiterBioTemplates,
  companyEmailDomains,
} from './data/names.js';

const TARGET_RECRUITER_COUNT = 300;
const RECRUITER_PASSWORD = 'JobSprint@2024';

/**
 * Determines how many recruiters a company should have based on its size.
 * @param {string} size - Company size enum value
 * @returns {{ min: number, max: number }}
 */
const getRecruiterCountBySize = (size) => {
  const mapping = {
    '1-10': { min: 1, max: 1 },
    '11-50': { min: 1, max: 2 },
    '51-200': { min: 1, max: 2 },
    '201-500': { min: 2, max: 3 },
    '501-1000': { min: 2, max: 3 },
    '1000+': { min: 3, max: 5 },
  };
  return mapping[size] || { min: 1, max: 2 };
};

/**
 * Generates the email domain for a company.
 * Falls back to a generated domain from the company name.
 */
const getEmailDomain = (companyName) => {
  if (companyEmailDomains[companyName]) {
    return companyEmailDomains[companyName];
  }
  // Generate domain from company name
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
  return `${slug}.com`;
};

const seedRecruiters = async () => {
  printHeader('Seeding Recruiters');

  // Pre-hash the shared password once (performance optimization)
  console.log('  🔐 Pre-hashing recruiter password...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(RECRUITER_PASSWORD, salt);

  // Get all companies
  const companies = await Company.find({}, '_id name size').lean();
  if (companies.length === 0) {
    throw new Error('No companies found. Run seedCompanies first.');
  }

  // Build recruiter distribution across companies
  const allNames = [...firstNamesMale, ...firstNamesFemale];
  const usedEmails = new Set();
  const recruiterUsers = [];
  const recruiterProfiles = [];
  let recruiterIndex = 0;

  // Distribute recruiters across companies
  for (const company of companies) {
    const { min, max } = getRecruiterCountBySize(company.size);
    const count = randomBetween(min, max);

    for (let i = 0; i < count && recruiterIndex < TARGET_RECRUITER_COUNT; i++) {
      const firstName = randomPick(allNames);
      const lastName = randomPick(lastNames);
      const domain = getEmailDomain(company.name);

      // Generate unique email
      let email;
      let attempts = 0;
      do {
        email = generateEmail(firstName, lastName, domain, recruiterIndex + attempts);
        attempts++;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const designation = randomPick(recruiterDesignations);
      const years = randomBetween(2, 15);
      const bio = randomPick(recruiterBioTemplates)
        .replace(/\{company\}/g, company.name)
        .replace(/\{years\}/g, String(years));

      recruiterUsers.push({
        email,
        passwordHash,
        role: 'recruiter',
        isVerified: true,
        isActive: true,
        lastLoginAt: new Date(Date.now() - randomBetween(0, 30) * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - randomBetween(30, 365) * 24 * 60 * 60 * 1000),
      });

      recruiterProfiles.push({
        // userId will be filled after User insertion
        _companyId: company._id,
        _companyName: company.name,
        _firstName: firstName,
        _lastName: lastName,
        _phone: generatePhone(),
        _designation: designation,
        _bio: bio,
        _linkedIn: generateLinkedIn(firstName, lastName),
        _profilePhoto: generateProfilePhoto(firstName, lastName, { background: '0D8ABC' }),
      });

      recruiterIndex++;
    }
  }

  // If we haven't reached the target, fill remaining slots across large companies
  const largeCompanies = companies.filter((c) => c.size === '1000+');
  while (recruiterIndex < TARGET_RECRUITER_COUNT) {
    const company = randomPick(largeCompanies);
    const firstName = randomPick(allNames);
    const lastName = randomPick(lastNames);
    const domain = getEmailDomain(company.name);

    let email;
    let attempts = 0;
    do {
      email = generateEmail(firstName, lastName, domain, recruiterIndex + attempts + 1000);
      attempts++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const designation = randomPick(recruiterDesignations);
    const years = randomBetween(2, 15);
    const bio = randomPick(recruiterBioTemplates)
      .replace(/\{company\}/g, company.name)
      .replace(/\{years\}/g, String(years));

    recruiterUsers.push({
      email,
      passwordHash,
      role: 'recruiter',
      isVerified: true,
      isActive: true,
      lastLoginAt: new Date(Date.now() - randomBetween(0, 30) * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - randomBetween(30, 365) * 24 * 60 * 60 * 1000),
    });

    recruiterProfiles.push({
      _companyId: company._id,
      _companyName: company.name,
      _firstName: firstName,
      _lastName: lastName,
      _phone: generatePhone(),
      _designation: designation,
      _bio: bio,
      _linkedIn: generateLinkedIn(firstName, lastName),
      _profilePhoto: generateProfilePhoto(firstName, lastName, { background: '0D8ABC' }),
    });

    recruiterIndex++;
  }

  // Insert User documents in batches
  const progress = createProgress('Recruiter Users', recruiterUsers.length);
  const insertedUsers = [];
  const batchSize = 100;

  for (let i = 0; i < recruiterUsers.length; i += batchSize) {
    const batch = recruiterUsers.slice(i, i + batchSize);
    // Use insertMany to bypass pre-save password hashing (already pre-hashed)
    const result = await User.insertMany(batch, { ordered: false });
    insertedUsers.push(...result);
    progress.update(batch.length);
  }
  progress.finish();

  // Build RecruiterProfile documents with userId references
  const profileDocs = insertedUsers.map((user, idx) => ({
    userId: user._id,
    companyId: recruiterProfiles[idx]._companyId,
    jobTitle: recruiterProfiles[idx]._designation,
    phone: recruiterProfiles[idx]._phone,
  }));

  // Insert RecruiterProfile documents
  const profileProgress = createProgress('Recruiter Profiles', profileDocs.length);

  for (let i = 0; i < profileDocs.length; i += batchSize) {
    const batch = profileDocs.slice(i, i + batchSize);
    await RecruiterProfile.insertMany(batch, { ordered: false });
    profileProgress.update(batch.length);
  }
  profileProgress.finish();

  console.log(`  📦 Total recruiters created: ${insertedUsers.length}`);

  // Return mapping of recruiter userId to companyId for downstream use
  return insertedUsers.map((user, idx) => ({
    userId: user._id,
    companyId: recruiterProfiles[idx]._companyId,
    companyName: recruiterProfiles[idx]._companyName,
  }));
};

export default seedRecruiters;
