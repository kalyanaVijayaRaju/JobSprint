/**
 * Seeds 3000 realistic job postings.
 * Distributes jobs across companies and recruiters with realistic
 * descriptions, requirements, skills, salary ranges, and dates.
 */

import Job from '../../src/models/Job.js';
import Company from '../../src/models/Company.js';
import User from '../../src/models/User.js';
import RecruiterProfile from '../../src/models/RecruiterProfile.js';
import { createProgress, printHeader } from './utils/progress.js';
import {
  randomPick,
  randomPicks,
  randomBetween,
  randomDate,
  generateSalaryRange,
} from './utils/helpers.js';
import { skillsByRole, experienceLevels } from './data/skills.js';
import { getWeightedCity } from './data/locations.js';
import {
  jobDescriptionTemplates,
  responsibilitiesByRole,
  defaultResponsibilities,
  qualificationsByExperience,
  benefits,
} from './data/jobTemplates.js';

const TARGET_JOB_COUNT = 3000;

/**
 * Gets a weighted random experience level.
 */
const getWeightedExperience = () => {
  const totalWeight = experienceLevels.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const exp of experienceLevels) {
    random -= exp.weight;
    if (random <= 0) return exp;
  }
  return experienceLevels[1]; // Default to 1-3 years
};

/**
 * Generates a full job description block.
 */
const generateJobDescription = (role, experienceLabel, companyName) => {
  const templates = jobDescriptionTemplates[role] || jobDescriptionTemplates['Full Stack Developer'];
  let description = randomPick(templates);

  // Add experience context
  description += `\n\nExperience Level: ${experienceLabel}\n\n`;
  description += `This is an exciting opportunity to join ${companyName} and work on cutting-edge technology that impacts millions of users. `;
  description += 'We offer a collaborative work environment, competitive compensation, and opportunities for professional growth.';

  return description;
};

/**
 * Gets responsibilities for a role.
 */
const getResponsibilities = (role) => {
  const roleResponsibilities = responsibilitiesByRole[role];
  if (roleResponsibilities) {
    return randomPicks(roleResponsibilities, randomBetween(5, 7));
  }
  return randomPicks(defaultResponsibilities, randomBetween(5, 7));
};

/**
 * Determines how many jobs a company should post based on size.
 */
const getJobCountBySize = (size) => {
  const mapping = {
    '1-10': { min: 2, max: 5 },
    '11-50': { min: 5, max: 10 },
    '51-200': { min: 8, max: 15 },
    '201-500': { min: 12, max: 25 },
    '501-1000': { min: 15, max: 30 },
    '1000+': { min: 25, max: 50 },
  };
  return mapping[size] || { min: 5, max: 10 };
};

const seedJobs = async () => {
  printHeader('Seeding Jobs');

  // Get all companies and recruiters
  const companies = await Company.find({}, '_id name size').lean();
  const recruiterProfiles = await RecruiterProfile.find({}, 'userId companyId').lean();

  if (companies.length === 0) {
    throw new Error('No companies found. Run seedCompanies first.');
  }
  if (recruiterProfiles.length === 0) {
    throw new Error('No recruiters found. Run seedRecruiters first.');
  }

  // Build a map: companyId -> [recruiterUserId]
  const companyRecruiterMap = new Map();
  for (const rp of recruiterProfiles) {
    const key = rp.companyId.toString();
    if (!companyRecruiterMap.has(key)) {
      companyRecruiterMap.set(key, []);
    }
    companyRecruiterMap.get(key).push(rp.userId);
  }

  const roleNames = Object.keys(skillsByRole);
  const locationTypes = ['remote', 'onsite', 'onsite', 'hybrid', 'hybrid']; // Weighted toward office
  const jobTypes = ['full-time', 'full-time', 'full-time', 'full-time', 'contract', 'internship']; // Weighted
  const statuses = [];
  // 70% active, 20% closed, 10% archived
  for (let i = 0; i < 70; i++) statuses.push('active');
  for (let i = 0; i < 20; i++) statuses.push('closed');
  for (let i = 0; i < 10; i++) statuses.push('archived');

  const jobDocs = [];
  let jobIndex = 0;

  // Distribute jobs across companies proportionally
  for (const company of companies) {
    const companyId = company._id.toString();
    const recruiterIds = companyRecruiterMap.get(companyId);

    if (!recruiterIds || recruiterIds.length === 0) continue;

    const { min, max } = getJobCountBySize(company.size);
    const jobCount = randomBetween(min, max);

    for (let i = 0; i < jobCount && jobIndex < TARGET_JOB_COUNT; i++) {
      const role = randomPick(roleNames);
      const roleSkills = skillsByRole[role];
      const experience = getWeightedExperience();
      const locationType = randomPick(locationTypes);
      const location = locationType === 'remote' ? 'Remote, India' : getWeightedCity();
      const jobType = randomPick(jobTypes);
      const salary = generateSalaryRange(experience.value);
      const status = randomPick(statuses);

      // Job posted 1-90 days ago
      const postedDate = randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      );

      // Expires 30-90 days after posting
      const expiresAt = new Date(postedDate);
      expiresAt.setDate(expiresAt.getDate() + randomBetween(30, 90));

      // Generate title with seniority prefix
      let title = role;
      if (experience.value === '5-8') {
        title = `Senior ${role}`;
      } else if (experience.value === '8+') {
        title = randomPick([`Staff ${role}`, `Principal ${role}`, `Lead ${role}`]);
      } else if (experience.value === 'fresher') {
        title = `Junior ${role}`;
      }

      const description = generateJobDescription(role, experience.label, company.name);
      const requirements = getResponsibilities(role);
      const skillsRequired = [
        ...randomPicks(roleSkills.required, randomBetween(3, roleSkills.required.length)),
        ...randomPicks(roleSkills.preferred, randomBetween(1, 3)),
      ];
      const uniqueSkills = [...new Set(skillsRequired)];

      const recruiterId = randomPick(recruiterIds);

      jobDocs.push({
        title,
        description,
        requirements,
        skillsRequired: uniqueSkills,
        companyId: company._id,
        recruiterId,
        locationType,
        location,
        salaryRange: {
          min: salary.min,
          max: salary.max,
          currency: 'INR',
        },
        jobType,
        status,
        expiresAt,
        createdAt: postedDate,
        updatedAt: postedDate,
      });

      jobIndex++;
    }
  }

  // If we haven't reached target, add more jobs to large companies
  const largeCompanies = companies.filter((c) => c.size === '1000+');
  while (jobIndex < TARGET_JOB_COUNT) {
    const company = randomPick(largeCompanies);
    const companyId = company._id.toString();
    const recruiterIds = companyRecruiterMap.get(companyId);

    if (!recruiterIds || recruiterIds.length === 0) continue;

    const role = randomPick(roleNames);
    const roleSkills = skillsByRole[role];
    const experience = getWeightedExperience();
    const locationType = randomPick(locationTypes);
    const location = locationType === 'remote' ? 'Remote, India' : getWeightedCity();
    const jobType = randomPick(jobTypes);
    const salary = generateSalaryRange(experience.value);
    const status = randomPick(statuses);

    const postedDate = randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    );

    const expiresAt = new Date(postedDate);
    expiresAt.setDate(expiresAt.getDate() + randomBetween(30, 90));

    let title = role;
    if (experience.value === '5-8') title = `Senior ${role}`;
    else if (experience.value === '8+') title = randomPick([`Staff ${role}`, `Principal ${role}`, `Lead ${role}`]);
    else if (experience.value === 'fresher') title = `Junior ${role}`;

    const description = generateJobDescription(role, experience.label, company.name);
    const requirements = getResponsibilities(role);
    const skillsRequired = [
      ...randomPicks(roleSkills.required, randomBetween(3, roleSkills.required.length)),
      ...randomPicks(roleSkills.preferred, randomBetween(1, 3)),
    ];

    jobDocs.push({
      title,
      description,
      requirements,
      skillsRequired: [...new Set(skillsRequired)],
      companyId: company._id,
      recruiterId: randomPick(recruiterIds),
      locationType,
      location,
      salaryRange: { min: salary.min, max: salary.max, currency: 'INR' },
      jobType,
      status,
      expiresAt,
      createdAt: postedDate,
      updatedAt: postedDate,
    });

    jobIndex++;
  }

  // Insert in batches
  const progress = createProgress('Jobs', jobDocs.length);
  const insertedJobs = [];
  const batchSize = 500;

  for (let i = 0; i < jobDocs.length; i += batchSize) {
    const batch = jobDocs.slice(i, i + batchSize);
    const result = await Job.insertMany(batch, { ordered: false });
    insertedJobs.push(...result);
    progress.update(batch.length);
  }
  progress.finish();

  console.log(`  📦 Total jobs created: ${insertedJobs.length}`);

  return insertedJobs.map((j) => ({
    jobId: j._id,
    companyId: j.companyId,
    recruiterId: j.recruiterId,
    title: j.title,
    createdAt: j.createdAt,
  }));
};

export default seedJobs;
