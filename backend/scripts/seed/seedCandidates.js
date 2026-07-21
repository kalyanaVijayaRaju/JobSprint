/**
 * Seeds candidate users and their profiles.
 * Creates 1000 candidate User documents + 1000 CandidateProfile documents.
 * Each candidate has realistic skills, experience, education, and portfolio.
 */

import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';
import CandidateProfile from '../../src/models/CandidateProfile.js';
import { createProgress, printHeader } from './utils/progress.js';
import {
  randomPick,
  randomPicks,
  randomBetween,
  randomDate,
  generatePhone,
  generateLinkedIn,
  generateGitHub,
  generateProfilePhoto,
  generateEmail,
  generateWebsite,
} from './utils/helpers.js';
import { firstNamesMale, firstNamesFemale, lastNames, candidateEmailDomains } from './data/names.js';
import { allSkills, skillsByRole } from './data/skills.js';
import { institutions, getWeightedDegree } from './data/institutions.js';
import { getWeightedCity } from './data/locations.js';
import companies from './data/companies.js';

const TARGET_CANDIDATE_COUNT = 1000;
const CANDIDATE_PASSWORD = 'JobSprint@2024';

/**
 * Generates a realistic summary/bio for a candidate.
 */
const generateSummary = (firstName, skills, yearsOfExp) => {
  const templates = [
    `Passionate software developer with ${yearsOfExp}+ years of experience specializing in ${skills.slice(0, 3).join(', ')}. Strong problem-solving skills and a commitment to writing clean, maintainable code. Looking for challenging opportunities to grow and make an impact.`,
    `Results-driven engineer with expertise in ${skills.slice(0, 3).join(', ')} and ${yearsOfExp} years of hands-on experience building production applications. Eager to contribute to innovative products and collaborate with talented teams.`,
    `Full-stack developer with ${yearsOfExp} years of experience across ${skills.slice(0, 4).join(', ')}. Proven track record of delivering high-quality software solutions in fast-paced environments. Open to exciting opportunities in product-driven companies.`,
    `Dedicated software professional with a strong foundation in ${skills.slice(0, 3).join(' and ')}. ${yearsOfExp} years of experience building scalable applications. Passionate about continuous learning and contributing to open-source communities.`,
    `Experienced ${skills[0]} developer with ${yearsOfExp} years in the industry. Skilled in ${skills.slice(1, 4).join(', ')}. Known for attention to detail, collaborative mindset, and delivering projects on time.`,
  ];
  return randomPick(templates);
};

/**
 * Generates experience entries for a candidate profile.
 */
const generateExperience = (yearsOfExp, candidateSkills) => {
  if (yearsOfExp === 0) return [];

  const experienceCount = yearsOfExp <= 2 ? 1 : yearsOfExp <= 5 ? randomBetween(1, 2) : randomBetween(2, 3);
  const experiences = [];
  const companyNames = companies.map((c) => c.name);

  const positions = [
    'Software Developer', 'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Associate Software Engineer', 'Senior Software Engineer',
    'Junior Developer', 'Web Developer', 'Application Developer', 'Systems Engineer',
    'DevOps Engineer', 'Data Engineer', 'QA Engineer', 'Mobile Developer',
  ];

  let currentEndDate = new Date();

  for (let i = 0; i < experienceCount; i++) {
    const isCurrentJob = i === 0;
    const durationMonths = randomBetween(12, yearsOfExp <= 3 ? 24 : 36);
    const endDate = new Date(currentEndDate);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - durationMonths);

    const company = randomPick(companyNames);
    const position = i === 0
      ? (yearsOfExp >= 5 ? 'Senior ' : '') + randomPick(positions)
      : randomPick(positions);

    const descriptions = [
      `Developed and maintained ${randomPick(candidateSkills)}-based applications serving thousands of users. Collaborated with cross-functional teams to deliver features on schedule.`,
      `Built scalable backend services and APIs using ${randomPick(candidateSkills)}. Improved system performance by ${randomBetween(20, 50)}% through code optimization and caching strategies.`,
      `Contributed to the development of key product features using ${candidateSkills.slice(0, 2).join(' and ')}. Participated in code reviews and mentored junior team members.`,
      `Designed and implemented microservices architecture for the core platform. Reduced deployment time by ${randomBetween(30, 60)}% by setting up CI/CD pipelines.`,
      `Worked on ${randomPick(candidateSkills)} projects, implementing responsive UIs and integrating with RESTful APIs. Wrote comprehensive unit and integration tests.`,
    ];

    experiences.push({
      company,
      position,
      location: getWeightedCity(),
      startDate,
      endDate: isCurrentJob ? undefined : endDate,
      current: isCurrentJob,
      description: randomPick(descriptions),
    });

    // Move end date back for the next (older) experience
    currentEndDate = new Date(startDate);
    currentEndDate.setMonth(currentEndDate.getMonth() - randomBetween(1, 6));
  }

  return experiences;
};

/**
 * Generates education entries for a candidate profile.
 */
const generateEducation = (yearsOfExp) => {
  const educationCount = randomBetween(1, 2);
  const educations = [];

  // Graduation end date is roughly yearsOfExp + 1 years ago
  const gradEndDate = new Date();
  gradEndDate.setFullYear(gradEndDate.getFullYear() - yearsOfExp - 1);

  for (let i = 0; i < educationCount; i++) {
    const { degree, field } = getWeightedDegree();
    const institution = randomPick(institutions);
    const duration = degree.startsWith('M') || degree === 'Ph.D' ? randomBetween(2, 3) : randomBetween(3, 4);

    const endDate = i === 0 ? new Date(gradEndDate) : new Date(gradEndDate);
    if (i > 0) {
      // Post-grad starts after undergrad
      endDate.setFullYear(gradEndDate.getFullYear() + duration + 1);
    }

    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - duration);

    educations.push({
      institution,
      degree,
      fieldOfStudy: field,
      startDate,
      endDate,
      current: false,
    });
  }

  return educations;
};

const seedCandidates = async () => {
  printHeader('Seeding Candidates');

  // Pre-hash the shared password once
  console.log('  🔐 Pre-hashing candidate password...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(CANDIDATE_PASSWORD, salt);

  const allFirstNames = [...firstNamesMale, ...firstNamesFemale];
  const usedEmails = new Set();
  const candidateUsers = [];
  const candidateProfileData = [];

  const roleNames = Object.keys(skillsByRole);

  for (let i = 0; i < TARGET_CANDIDATE_COUNT; i++) {
    const firstName = randomPick(allFirstNames);
    const lastName = randomPick(lastNames);
    const domain = randomPick(candidateEmailDomains);

    // Generate unique email
    let email;
    let attempts = 0;
    do {
      email = generateEmail(firstName, lastName, domain, i + attempts);
      attempts++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Determine experience level
    const yearsOfExp = randomPick([0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 7, 8, 10, 12]);

    // Generate role-coherent skills
    const primaryRole = randomPick(roleNames);
    const roleSkills = skillsByRole[primaryRole];
    const candidateSkills = [
      ...randomPicks(roleSkills.required, randomBetween(2, roleSkills.required.length)),
      ...randomPicks(roleSkills.preferred, randomBetween(1, 4)),
      ...randomPicks(allSkills, randomBetween(0, 2)),
    ];
    // Deduplicate
    const uniqueSkills = [...new Set(candidateSkills)];

    const createdAt = randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    candidateUsers.push({
      email,
      passwordHash,
      role: 'candidate',
      isVerified: Math.random() > 0.05, // 95% verified
      isActive: Math.random() > 0.02, // 98% active
      lastLoginAt: randomDate(createdAt, new Date()),
      createdAt,
    });

    candidateProfileData.push({
      _firstName: firstName,
      _lastName: lastName,
      _yearsOfExp: yearsOfExp,
      _skills: uniqueSkills,
    });
  }

  // Insert User documents
  const userProgress = createProgress('Candidate Users', candidateUsers.length);
  const insertedUsers = [];
  const batchSize = 200;

  for (let i = 0; i < candidateUsers.length; i += batchSize) {
    const batch = candidateUsers.slice(i, i + batchSize);
    const result = await User.insertMany(batch, { ordered: false });
    insertedUsers.push(...result);
    userProgress.update(batch.length);
  }
  userProgress.finish();

  // Build CandidateProfile documents
  const profileDocs = insertedUsers.map((user, idx) => {
    const data = candidateProfileData[idx];
    const experience = generateExperience(data._yearsOfExp, data._skills);
    const education = generateEducation(data._yearsOfExp);

    const hasGitHub = Math.random() > 0.3; // 70% have GitHub
    const hasWebsite = Math.random() > 0.7; // 30% have personal website

    return {
      userId: user._id,
      firstName: data._firstName,
      lastName: data._lastName,
      phone: generatePhone(),
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      summary: generateSummary(data._firstName, data._skills, data._yearsOfExp),
      skills: data._skills,
      experience,
      education,
      portfolioLinks: {
        github: hasGitHub ? generateGitHub(data._firstName, data._lastName) : undefined,
        linkedin: generateLinkedIn(data._firstName, data._lastName),
        website: hasWebsite ? generateWebsite(data._firstName, data._lastName) : undefined,
      },
    };
  });

  // Insert CandidateProfile documents
  const profileProgress = createProgress('Candidate Profiles', profileDocs.length);

  for (let i = 0; i < profileDocs.length; i += batchSize) {
    const batch = profileDocs.slice(i, i + batchSize);
    await CandidateProfile.insertMany(batch, { ordered: false });
    profileProgress.update(batch.length);
  }
  profileProgress.finish();

  console.log(`  📦 Total candidates created: ${insertedUsers.length}`);

  return insertedUsers.map((u) => u._id);
};

export default seedCandidates;
