/**
 * Generates analytics summaries by running aggregation pipelines
 * against the seeded data. Outputs formatted statistics to the console
 * and optionally writes a JSON summary file.
 */

import mongoose from 'mongoose';
import Job from '../../src/models/Job.js';
import Application from '../../src/models/Application.js';
import Company from '../../src/models/Company.js';
import CandidateProfile from '../../src/models/CandidateProfile.js';
import User from '../../src/models/User.js';
import { printHeader } from './utils/progress.js';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seedAnalytics = async () => {
  printHeader('Generating Analytics');

  const analytics = {};

  // 1. Top 20 Most In-Demand Skills
  console.log('  📊 Calculating top skills...');
  const topSkills = await Job.aggregate([
    { $unwind: '$skillsRequired' },
    { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
    { $project: { skill: '$_id', count: 1, _id: 0 } },
  ]);
  analytics.topSkills = topSkills;

  console.log('  ┌─────────────────────────────────┬───────┐');
  console.log('  │ Skill                           │ Count │');
  console.log('  ├─────────────────────────────────┼───────┤');
  for (const { skill, count } of topSkills) {
    console.log(`  │ ${skill.padEnd(31)} │ ${String(count).padStart(5)} │`);
  }
  console.log('  └─────────────────────────────────┴───────┘');

  // 2. Top 10 Most Applied-To Jobs
  console.log('\n  📊 Calculating most applied jobs...');
  const mostAppliedJobs = await Application.aggregate([
    { $group: { _id: '$jobId', applicationCount: { $sum: 1 } } },
    { $sort: { applicationCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: '$job' },
    {
      $lookup: {
        from: 'companies',
        localField: 'job.companyId',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $project: {
        title: '$job.title',
        company: '$company.name',
        applicationCount: 1,
        _id: 0,
      },
    },
  ]);
  analytics.mostAppliedJobs = mostAppliedJobs;

  console.log('  ┌─────────────────────────────────────────────────┬──────────────────────┬───────┐');
  console.log('  │ Job Title                                       │ Company              │ Apps  │');
  console.log('  ├─────────────────────────────────────────────────┼──────────────────────┼───────┤');
  for (const { title, company, applicationCount } of mostAppliedJobs) {
    console.log(`  │ ${title.slice(0, 47).padEnd(47)} │ ${company.slice(0, 20).padEnd(20)} │ ${String(applicationCount).padStart(5)} │`);
  }
  console.log('  └─────────────────────────────────────────────────┴──────────────────────┴───────┘');

  // 3. Top 10 Most Active Companies (by job count)
  console.log('\n  📊 Calculating most active companies...');
  const mostActiveCompanies = await Job.aggregate([
    { $group: { _id: '$companyId', jobCount: { $sum: 1 } } },
    { $sort: { jobCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'companies',
        localField: '_id',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company' },
    {
      $project: {
        company: '$company.name',
        industry: '$company.industry',
        jobCount: 1,
        _id: 0,
      },
    },
  ]);
  analytics.mostActiveCompanies = mostActiveCompanies;

  console.log('  ┌──────────────────────────────┬──────────────────┬───────┐');
  console.log('  │ Company                      │ Industry         │ Jobs  │');
  console.log('  ├──────────────────────────────┼──────────────────┼───────┤');
  for (const { company, industry, jobCount } of mostActiveCompanies) {
    console.log(`  │ ${company.slice(0, 28).padEnd(28)} │ ${industry.slice(0, 16).padEnd(16)} │ ${String(jobCount).padStart(5)} │`);
  }
  console.log('  └──────────────────────────────┴──────────────────┴───────┘');

  // 4. Monthly Application Volume (last 3 months)
  console.log('\n  📊 Calculating monthly application volume...');
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const monthlyApplications = await Application.aggregate([
    { $match: { createdAt: { $gte: threeMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  analytics.monthlyApplications = monthlyApplications;

  for (const { _id, count } of monthlyApplications) {
    const monthName = new Date(_id.year, _id.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    console.log(`  ${monthName}: ${count.toLocaleString()} applications`);
  }

  // 5. Hiring Funnel Conversion Rates
  console.log('\n  📊 Calculating hiring funnel...');
  const statusCounts = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  analytics.hiringFunnel = statusCounts;

  const totalApps = statusCounts.reduce((sum, s) => sum + s.count, 0);
  console.log(`\n  Total Applications: ${totalApps.toLocaleString()}`);
  for (const { _id, count } of statusCounts) {
    const pct = ((count / totalApps) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct / 2));
    console.log(`  ${_id.padEnd(14)} ${bar} ${count.toLocaleString()} (${pct}%)`);
  }

  // 6. Platform Summary
  console.log('\n  📊 Platform Summary...');
  const summary = {
    totalUsers: await User.countDocuments(),
    totalCandidates: await User.countDocuments({ role: 'candidate' }),
    totalRecruiters: await User.countDocuments({ role: 'recruiter' }),
    totalCompanies: await Company.countDocuments(),
    totalJobs: await Job.countDocuments(),
    activeJobs: await Job.countDocuments({ status: 'active' }),
    totalApplications: await Application.countDocuments(),
    totalProfiles: await CandidateProfile.countDocuments(),
  };
  analytics.summary = summary;

  console.log(`  Users:        ${summary.totalUsers.toLocaleString()}`);
  console.log(`  Candidates:   ${summary.totalCandidates.toLocaleString()}`);
  console.log(`  Recruiters:   ${summary.totalRecruiters.toLocaleString()}`);
  console.log(`  Companies:    ${summary.totalCompanies.toLocaleString()}`);
  console.log(`  Jobs:         ${summary.totalJobs.toLocaleString()} (${summary.activeJobs.toLocaleString()} active)`);
  console.log(`  Applications: ${summary.totalApplications.toLocaleString()}`);
  console.log(`  Profiles:     ${summary.totalProfiles.toLocaleString()}`);

  // Write analytics JSON to output directory
  try {
    const outputDir = path.join(__dirname, 'output');
    await mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'analytics.json');
    await writeFile(outputPath, JSON.stringify(analytics, null, 2));
    console.log(`\n  📄 Analytics written to: ${outputPath}`);
  } catch (error) {
    console.warn(`  ⚠️  Could not write analytics file: ${error.message}`);
  }

  return analytics;
};

export default seedAnalytics;
