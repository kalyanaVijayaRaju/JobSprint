import SalaryInsight from '../models/SalaryInsight.js';
import ApiError from '../utils/apiError.js';

/**
 * Get salary data for a given job title, location, and experience level.
 */
export const getSalaryData = async (filters = {}) => {
  const query = {};
  if (filters.jobTitle) query.normalizedTitle = new RegExp(filters.jobTitle.toLowerCase().trim(), 'i');
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;

  const results = await SalaryInsight.find(query)
    .sort({ medianSalary: -1 })
    .limit(50)
    .lean();

  // Compute aggregated stats
  if (results.length > 0) {
    const allMin = results.map(r => r.minSalary);
    const allMax = results.map(r => r.maxSalary);
    const allMedian = results.map(r => r.medianSalary);

    return {
      results,
      aggregate: {
        avgMin: Math.round(allMin.reduce((a, b) => a + b, 0) / allMin.length),
        avgMax: Math.round(allMax.reduce((a, b) => a + b, 0) / allMax.length),
        avgMedian: Math.round(allMedian.reduce((a, b) => a + b, 0) / allMedian.length),
        count: results.length
      }
    };
  }

  return { results: [], aggregate: null };
};

/**
 * Submit an anonymous salary report.
 */
export const submitReport = async (userId, data) => {
  return SalaryInsight.create({
    jobTitle: data.jobTitle,
    location: data.location,
    experienceLevel: data.experienceLevel,
    minSalary: data.minSalary,
    maxSalary: data.maxSalary,
    medianSalary: data.medianSalary || Math.round((data.minSalary + data.maxSalary) / 2),
    currency: data.currency || 'INR',
    industry: data.industry || 'Technology',
    source: 'user-report',
    userId,
    isAnonymous: true
  });
};

/**
 * Get salary trends by experience level for a job title.
 */
export const getSalaryTrends = async (jobTitle) => {
  const pipeline = [
    { $match: { normalizedTitle: new RegExp(jobTitle.toLowerCase().trim(), 'i') } },
    {
      $group: {
        _id: '$experienceLevel',
        avgMin: { $avg: '$minSalary' },
        avgMax: { $avg: '$maxSalary' },
        avgMedian: { $avg: '$medianSalary' },
        count: { $sum: 1 }
      }
    },
    { $sort: { avgMedian: 1 } }
  ];

  const trends = await SalaryInsight.aggregate(pipeline);

  const levelOrder = ['entry', 'mid', 'senior', 'lead', 'executive'];
  return trends.sort((a, b) => levelOrder.indexOf(a._id) - levelOrder.indexOf(b._id)).map(t => ({
    level: t._id,
    avgMin: Math.round(t.avgMin),
    avgMax: Math.round(t.avgMax),
    avgMedian: Math.round(t.avgMedian),
    reportCount: t.count
  }));
};

/**
 * Seed salary data for common roles.
 */
export const seedSalaryData = async () => {
  const count = await SalaryInsight.countDocuments();
  if (count > 0) return { seeded: false, message: 'Salary data already exists' };

  const salaries = [
    // Software Engineering
    { jobTitle: 'Software Engineer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 500000, maxSalary: 1000000, medianSalary: 700000 },
    { jobTitle: 'Software Engineer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 1000000, maxSalary: 2000000, medianSalary: 1500000 },
    { jobTitle: 'Software Engineer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 2000000, maxSalary: 4000000, medianSalary: 2800000 },
    { jobTitle: 'Software Engineer', location: 'Bangalore', experienceLevel: 'lead', minSalary: 3500000, maxSalary: 6000000, medianSalary: 4500000 },
    { jobTitle: 'Software Engineer', location: 'Hyderabad', experienceLevel: 'entry', minSalary: 450000, maxSalary: 900000, medianSalary: 650000 },
    { jobTitle: 'Software Engineer', location: 'Hyderabad', experienceLevel: 'mid', minSalary: 900000, maxSalary: 1800000, medianSalary: 1400000 },
    { jobTitle: 'Software Engineer', location: 'Hyderabad', experienceLevel: 'senior', minSalary: 1800000, maxSalary: 3500000, medianSalary: 2500000 },

    // Frontend
    { jobTitle: 'Frontend Developer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 400000, maxSalary: 800000, medianSalary: 600000 },
    { jobTitle: 'Frontend Developer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 900000, maxSalary: 1800000, medianSalary: 1300000 },
    { jobTitle: 'Frontend Developer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 1800000, maxSalary: 3500000, medianSalary: 2600000 },

    // Full Stack
    { jobTitle: 'Full Stack Developer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 500000, maxSalary: 1000000, medianSalary: 750000 },
    { jobTitle: 'Full Stack Developer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 1200000, maxSalary: 2200000, medianSalary: 1600000 },
    { jobTitle: 'Full Stack Developer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 2200000, maxSalary: 4200000, medianSalary: 3000000 },
    { jobTitle: 'Full Stack Developer', location: 'Mumbai', experienceLevel: 'mid', minSalary: 1000000, maxSalary: 2000000, medianSalary: 1500000 },

    // Data Science
    { jobTitle: 'Data Scientist', location: 'Bangalore', experienceLevel: 'entry', minSalary: 600000, maxSalary: 1200000, medianSalary: 800000 },
    { jobTitle: 'Data Scientist', location: 'Bangalore', experienceLevel: 'mid', minSalary: 1400000, maxSalary: 2800000, medianSalary: 2000000 },
    { jobTitle: 'Data Scientist', location: 'Bangalore', experienceLevel: 'senior', minSalary: 2800000, maxSalary: 5000000, medianSalary: 3800000 },

    // DevOps
    { jobTitle: 'DevOps Engineer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 500000, maxSalary: 1000000, medianSalary: 700000 },
    { jobTitle: 'DevOps Engineer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 1200000, maxSalary: 2400000, medianSalary: 1700000 },
    { jobTitle: 'DevOps Engineer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 2400000, maxSalary: 4500000, medianSalary: 3200000 },

    // Product Management
    { jobTitle: 'Product Manager', location: 'Bangalore', experienceLevel: 'mid', minSalary: 1500000, maxSalary: 3000000, medianSalary: 2200000 },
    { jobTitle: 'Product Manager', location: 'Bangalore', experienceLevel: 'senior', minSalary: 3000000, maxSalary: 5500000, medianSalary: 4000000 },
    { jobTitle: 'Product Manager', location: 'Bangalore', experienceLevel: 'lead', minSalary: 4500000, maxSalary: 8000000, medianSalary: 6000000 },

    // UI/UX Design
    { jobTitle: 'UI/UX Designer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 350000, maxSalary: 700000, medianSalary: 500000 },
    { jobTitle: 'UI/UX Designer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 800000, maxSalary: 1600000, medianSalary: 1200000 },
    { jobTitle: 'UI/UX Designer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 1600000, maxSalary: 3200000, medianSalary: 2200000 },

    // QA
    { jobTitle: 'QA Engineer', location: 'Bangalore', experienceLevel: 'entry', minSalary: 350000, maxSalary: 700000, medianSalary: 500000 },
    { jobTitle: 'QA Engineer', location: 'Bangalore', experienceLevel: 'mid', minSalary: 800000, maxSalary: 1500000, medianSalary: 1100000 },
    { jobTitle: 'QA Engineer', location: 'Bangalore', experienceLevel: 'senior', minSalary: 1500000, maxSalary: 2800000, medianSalary: 2000000 },

    // Business Analyst
    { jobTitle: 'Business Analyst', location: 'Bangalore', experienceLevel: 'entry', minSalary: 400000, maxSalary: 800000, medianSalary: 600000 },
    { jobTitle: 'Business Analyst', location: 'Bangalore', experienceLevel: 'mid', minSalary: 900000, maxSalary: 1800000, medianSalary: 1300000 },
    { jobTitle: 'Business Analyst', location: 'Bangalore', experienceLevel: 'senior', minSalary: 1800000, maxSalary: 3200000, medianSalary: 2400000 },

    // Remote roles
    { jobTitle: 'Software Engineer', location: 'Remote', experienceLevel: 'mid', minSalary: 1200000, maxSalary: 2500000, medianSalary: 1800000 },
    { jobTitle: 'Software Engineer', location: 'Remote', experienceLevel: 'senior', minSalary: 2500000, maxSalary: 5000000, medianSalary: 3500000 },
    { jobTitle: 'Full Stack Developer', location: 'Remote', experienceLevel: 'senior', minSalary: 2400000, maxSalary: 4800000, medianSalary: 3400000 },
  ];

  const docs = salaries.map(s => ({ ...s, currency: 'INR', industry: 'Technology', source: 'seed' }));
  await SalaryInsight.insertMany(docs);
  return { seeded: true, count: docs.length };
};
