import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import CandidateProfile from '../models/CandidateProfile.js';
import ApiError from '../utils/apiError.js';

/**
 * Platform-wide analytics for the admin dashboard.
 *
 * Returns user counts by role, active job stats, application pipeline totals,
 * monthly sign-up trends (last 6 months), and placement/offer rates.
 */
export const getPlatformAnalytics = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    usersByRole,
    jobStats,
    applicationStats,
    monthlySignups,
    topSkills,
    topCompanies
  ] = await Promise.all([
    // Users grouped by role
    User.aggregate([
      { $group: { _id: '$role', total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
    ]),

    // Job counts by status
    Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // Application pipeline summary
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // Monthly user sign-up trend (last 6 months)
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    // Top 10 most in-demand skills (across active jobs)
    Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skillsRequired' },
      { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),

    // Top 10 hiring companies by active job count
    Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$companyId', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      { $project: { _id: 1, jobCount: 1, name: '$company.name', logo: '$company.logo', industry: '$company.industry' } }
    ])
  ]);

  // Normalize role counts
  const roles = { candidate: 0, recruiter: 0, admin: 0 };
  const activeRoles = { candidate: 0, recruiter: 0, admin: 0 };
  usersByRole.forEach(({ _id, total, active }) => {
    if (_id in roles) {
      roles[_id] = total;
      activeRoles[_id] = active;
    }
  });

  // Normalize job stats
  const jobs = { active: 0, closed: 0, archived: 0 };
  jobStats.forEach(({ _id, count }) => {
    if (_id in jobs) jobs[_id] = count;
  });

  // Normalize application stats
  const applications = { applied: 0, screening: 0, interviewing: 0, offered: 0, rejected: 0, withdrawn: 0 };
  applicationStats.forEach(({ _id, count }) => {
    if (_id in applications) applications[_id] = count;
  });

  const totalApplications = Object.values(applications).reduce((a, b) => a + b, 0);

  // Format monthly sign-ups with month labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const signupTrend = monthlySignups.map(({ _id, count }) => ({
    month: monthNames[_id.month - 1],
    year: _id.year,
    label: `${monthNames[_id.month - 1]} ${_id.year}`,
    count
  }));

  return {
    users: {
      total: roles.candidate + roles.recruiter + roles.admin,
      byRole: roles,
      active: activeRoles
    },
    jobs: {
      total: jobs.active + jobs.closed + jobs.archived,
      byStatus: jobs
    },
    applications: {
      total: totalApplications,
      byStatus: applications,
      offerRate: totalApplications > 0 ? Math.round((applications.offered / totalApplications) * 100) : 0,
      placementRate: totalApplications > 0 ? Math.round((applications.offered / totalApplications) * 100) : 0
    },
    signupTrend,
    topSkills: topSkills.map(({ _id, count }) => ({ skill: _id, count })),
    topCompanies
  };
};

/**
 * Recruiter-specific analytics: own postings, pipeline health, conversion rates.
 */
export const getRecruiterAnalytics = async (recruiterId) => {
  const ownedJobs = await Job.find({ recruiterId }).select('_id status createdAt').lean();
  const jobIds = ownedJobs.map((j) => j._id);

  if (jobIds.length === 0) {
    return {
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
      totalApplications: 0,
      pipeline: { applied: 0, screening: 0, interviewing: 0, offered: 0, rejected: 0, withdrawn: 0 },
      conversionRate: 0,
      offerRate: 0,
      avgApplicationsPerJob: 0,
      recentApplications: []
    };
  }

  const [pipelineRows, recentApps] = await Promise.all([
    Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    Application.find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('candidateId', 'email')
      .populate({
        path: 'jobId',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'name logo' }
      })
      .lean()
  ]);

  const pipeline = { applied: 0, screening: 0, interviewing: 0, offered: 0, rejected: 0, withdrawn: 0 };
  pipelineRows.forEach(({ _id, count }) => {
    if (_id in pipeline) pipeline[_id] = count;
  });

  const totalApps = Object.values(pipeline).reduce((a, b) => a + b, 0);
  const activeJobs = ownedJobs.filter((j) => j.status === 'active').length;

  return {
    totalJobs: ownedJobs.length,
    activeJobs,
    closedJobs: ownedJobs.filter((j) => j.status === 'closed').length,
    totalApplications: totalApps,
    pipeline,
    conversionRate: totalApps > 0 ? Math.round(((pipeline.interviewing + pipeline.offered) / totalApps) * 100) : 0,
    offerRate: totalApps > 0 ? Math.round((pipeline.offered / totalApps) * 100) : 0,
    avgApplicationsPerJob: ownedJobs.length > 0 ? Math.round(totalApps / ownedJobs.length) : 0,
    recentApplications: recentApps
  };
};

/**
 * Candidate-specific analytics: application success rates, profile views,
 * recommended jobs based on skill intersection with active postings.
 */
export const getCandidateAnalytics = async (candidateId) => {
  const [profile, appStats, recommendedJobs] = await Promise.all([
    CandidateProfile.findOne({ userId: candidateId }).lean(),

    Application.aggregate([
      { $match: { candidateId: new mongoose.Types.ObjectId(candidateId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),

    // Deferred — resolved below after profile skills are available
    null
  ]);

  const pipeline = { applied: 0, screening: 0, interviewing: 0, offered: 0, rejected: 0, withdrawn: 0 };
  appStats.forEach(({ _id, count }) => {
    if (_id in pipeline) pipeline[_id] = count;
  });
  const totalApps = Object.values(pipeline).reduce((a, b) => a + b, 0);

  // Profile completeness calculation
  const completeness = computeProfileCompleteness(profile);

  // Skill-based job recommendations
  let recommendations = [];
  if (profile && profile.skills.length > 0) {
    recommendations = await Job.aggregate([
      { $match: { status: 'active', expiresAt: { $gt: new Date() } } },
      {
        $addFields: {
          matchedSkills: { $setIntersection: ['$skillsRequired', profile.skills] },
          totalRequired: { $size: '$skillsRequired' }
        }
      },
      { $addFields: { matchCount: { $size: '$matchedSkills' } } },
      { $match: { matchCount: { $gte: 1 } } },
      {
        $addFields: {
          matchScore: {
            $cond: {
              if: { $gt: ['$totalRequired', 0] },
              then: { $round: [{ $multiply: [{ $divide: ['$matchCount', '$totalRequired'] }, 100] }, 0] },
              else: 0
            }
          }
        }
      },
      { $sort: { matchScore: -1, createdAt: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'companies',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          locationType: 1,
          jobType: 1,
          salaryRange: 1,
          skillsRequired: 1,
          matchedSkills: 1,
          matchScore: 1,
          createdAt: 1,
          company: { _id: '$company._id', name: '$company.name', logo: '$company.logo' }
        }
      }
    ]);
  }

  // Skills market demand — how many active jobs require each of the candidate's skills
  let skillDemand = [];
  if (profile && profile.skills.length > 0) {
    skillDemand = await Job.aggregate([
      { $match: { status: 'active', skillsRequired: { $in: profile.skills } } },
      { $unwind: '$skillsRequired' },
      { $match: { skillsRequired: { $in: profile.skills } } },
      { $group: { _id: '$skillsRequired', demand: { $sum: 1 } } },
      { $sort: { demand: -1 } }
    ]);
  }

  return {
    applications: {
      total: totalApps,
      byStatus: pipeline,
      successRate: totalApps > 0 ? Math.round(((pipeline.offered + pipeline.interviewing) / totalApps) * 100) : 0
    },
    profileCompleteness: completeness,
    recommendations,
    skillDemand: skillDemand.map(({ _id, demand }) => ({ skill: _id, demand }))
  };
};

/**
 * Time-series trend data for admin charts.
 * Returns daily or weekly aggregations over a configurable date range.
 */
export const getTrendData = async (query = {}) => {
  const {
    period = 'daily',
    days = 30
  } = query;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const dateGrouping = period === 'weekly'
    ? { year: { $isoWeekYear: '$createdAt' }, week: { $isoWeek: '$createdAt' } }
    : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };

  const [signups, jobPosts, applications] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGrouping, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]),

    Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGrouping, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]),

    Application.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: dateGrouping, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ])
  ]);

  const formatLabel = (id) => {
    if (period === 'weekly') return `W${id.week} ${id.year}`;
    const month = String(id.month).padStart(2, '0');
    const day = String(id.day).padStart(2, '0');
    return `${id.year}-${month}-${day}`;
  };

  return {
    period,
    days,
    signups: signups.map(({ _id, count }) => ({ label: formatLabel(_id), count })),
    jobPosts: jobPosts.map(({ _id, count }) => ({ label: formatLabel(_id), count })),
    applications: applications.map(({ _id, count }) => ({ label: formatLabel(_id), count }))
  };
};

/**
 * Compute candidate profile completeness as a percentage with
 * a per-section breakdown for the frontend checklist.
 */
function computeProfileCompleteness(profile) {
  if (!profile) {
    return { percentage: 0, sections: { name: false, resume: false, skills: false, experience: false, education: false, portfolio: false } };
  }

  const sections = {
    name: !!(profile.firstName && profile.lastName),
    resume: !!profile.resumeUrl,
    skills: profile.skills.length > 0,
    experience: profile.experience.length > 0,
    education: profile.education.length > 0,
    portfolio: !!(profile.portfolioLinks?.github || profile.portfolioLinks?.linkedin || profile.portfolioLinks?.website)
  };

  const filled = Object.values(sections).filter(Boolean).length;
  const total = Object.keys(sections).length;

  return {
    percentage: Math.round((filled / total) * 100),
    sections
  };
}
