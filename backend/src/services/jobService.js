import Job from '../models/Job.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/apiError.js';
import { dispatchJobAlerts } from './jobAlertService.js';

/**
 * Create a new job posting.
 *
 * Resolves the recruiter's company from their profile so the Job document
 * is properly linked.  Throws if the recruiter has no profile/company yet.
 *
 * @param {string} recruiterId - The authenticated user's ID
 * @param {Object} data        - Validated job payload
 * @returns {Object} The created job document
 */
export const createJob = async (recruiterId, data) => {
  const recruiterProfile = await RecruiterProfile.findOne({ userId: recruiterId });

  if (!recruiterProfile) {
    throw new ApiError(400, 'You must complete your recruiter profile before posting jobs');
  }

  const job = await Job.create({
    ...data,
    recruiterId,
    companyId: recruiterProfile.companyId
  });

  // Trigger matching job alerts asynchronously
  dispatchJobAlerts(job).catch(err => console.error('Error dispatching job alerts:', err));

  return job;
};

/**
 * List jobs with pagination, search, and filters.
 *
 * @param {Object} query - Parsed and validated query parameters
 * @returns {{ jobs: Array, pagination: Object }}
 */
export const getJobs = async (query) => {
  const {
    page,
    limit,
    search,
    companyId,
    location,
    locationType,
    jobType,
    status,
    sortBy,
    sortOrder,
    salaryMin,
    salaryMax
  } = query;

  const filter = { status };

  if (companyId) {
    filter.companyId = companyId;
  }

  // Only show non-expired jobs for public listings of active posts
  if (status === 'active') {
    filter.expiresAt = { $gt: new Date() };
  }

  if (salaryMin !== undefined) {
    filter['salaryRange.min'] = { $gte: salaryMin };
  }

  if (salaryMax !== undefined) {
    filter['salaryRange.max'] = { $lte: salaryMax };
  }


  if (locationType) {
    filter.locationType = locationType;
  }

  if (jobType) {
    filter.jobType = jobType;
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  // Full-text search on title and description using the text index
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  // When doing a text search, include the relevance score and sort by it
  const projection = search ? { score: { $meta: 'textScore' } } : {};
  const sort = search
    ? { score: { $meta: 'textScore' }, [sortBy]: sortDirection }
    : { [sortBy]: sortDirection };

  const [jobs, totalJobs] = await Promise.all([
    Job.find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('companyId', 'name logo industry')
      .lean(),
    Job.countDocuments(filter)
  ]);

  return {
    jobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      limit
    }
  };
};

/**
 * Autocomplete suggestions for job search.
 *
 * Returns up to 10 job title and skill matches for a prefix query.
 * Results are deduplicated and sorted by relevance.
 *
 * @param {string} query - The search prefix (min 2 characters)
 * @returns {{ suggestions: Array }}
 */
export const getAutocomplete = async (query) => {
  if (!query || query.length < 2) return { suggestions: [] };

  const regex = new RegExp(`^${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

  const [titleMatches, skillMatches] = await Promise.all([
    // Match job titles
    Job.find(
      { status: 'active', title: { $regex: regex } },
      { title: 1, _id: 0 }
    )
      .limit(10)
      .lean(),

    // Match skills
    Job.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skillsRequired' },
      { $match: { skillsRequired: { $regex: regex } } },
      { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  const seen = new Set();
  const suggestions = [];

  // Add title matches
  for (const { title } of titleMatches) {
    const key = title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push({ text: title, type: 'title' });
    }
  }

  // Add skill matches
  for (const { _id: skill, count } of skillMatches) {
    const key = skill.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      suggestions.push({ text: skill, type: 'skill', count });
    }
  }

  return { suggestions: suggestions.slice(0, 10) };
};

/**
 * Get a single job by its ID with populated company data.
 *
 * @param {string} jobId
 * @returns {Object} The job document
 */
export const getJobById = async (jobId) => {
  const job = await Job.findById(jobId)
    .populate('companyId', 'name logo website description industry size')
    .lean();

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  return job;
};

/**
 * Update a job posting.  Only the recruiter who owns the job (or an admin,
 * handled at the route/controller level) may call this.
 *
 * @param {string} jobId
 * @param {string} recruiterId - The authenticated user's ID
 * @param {Object} data        - Fields to update
 * @returns {Object} The updated job document
 */
export const updateJob = async (jobId, recruiterId, data) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.recruiterId.toString() !== recruiterId) {
    throw new ApiError(403, 'You can only update your own job postings');
  }

  Object.assign(job, data);
  await job.save();

  return job;
};

/**
 * Soft-delete a job by setting its status to 'archived'.
 *
 * @param {string} jobId
 * @param {string} recruiterId
 * @returns {Object} The archived job document
 */
export const deleteJob = async (jobId, recruiterId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.recruiterId.toString() !== recruiterId) {
    throw new ApiError(403, 'You can only delete your own job postings');
  }

  job.status = 'archived';
  await job.save();

  return job;
};

const ensureJobManager = (job, actorId, actorRole) => {
  if (actorRole !== 'admin' && job.recruiterId.toString() !== actorId) {
    throw new ApiError(403, 'You can only manage your own job postings');
  }
};

const logJobLifecycleEvent = (job, actorId, action, requestContext = {}) => AuditLog.logEvent({
  userId: actorId,
  action,
  severity: 'info',
  details: {
    jobId: job._id,
    title: job.title,
    companyId: job.companyId,
    status: job.status,
    expiresAt: job.expiresAt
  },
  ...requestContext
});

/** Explicitly close an active job and retain it for recruiter records. */
export const closeJob = async (jobId, actorId, actorRole, requestContext = {}) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  ensureJobManager(job, actorId, actorRole);
  if (job.status !== 'active') throw new ApiError(400, `Only active jobs can be closed (current status: ${job.status})`);

  job.status = 'closed';
  await job.save();
  await logJobLifecycleEvent(job, actorId, 'job.closed', requestContext);
  return job;
};

/** Reopen a closed job with an explicitly supplied future expiration date. */
export const reopenJob = async (jobId, actorId, actorRole, { expiresAt }, requestContext = {}) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  ensureJobManager(job, actorId, actorRole);
  if (job.status !== 'closed') throw new ApiError(400, 'Only closed jobs can be reopened');

  job.status = 'active';
  job.expiresAt = new Date(expiresAt);
  await job.save();
  await logJobLifecycleEvent(job, actorId, 'job.reopened', requestContext);
  return job;
};

/**
 * Idempotently close active postings whose expiry date has passed. This is
 * designed for a scheduler or cron runner and is safe to call repeatedly.
 */
export const expireOverdueJobs = async (now = new Date()) => {
  const overdueJobs = await Job.find({ status: 'active', expiresAt: { $lte: now } })
    .select('_id title companyId expiresAt')
    .lean();
  if (overdueJobs.length === 0) return { expiredCount: 0 };

  await Job.updateMany(
    { _id: { $in: overdueJobs.map((job) => job._id) }, status: 'active' },
    { $set: { status: 'closed' } }
  );

  await AuditLog.insertMany(overdueJobs.map((job) => ({
    userId: null,
    action: 'job.auto_closed',
    severity: 'info',
    details: {
      jobId: job._id,
      title: job.title,
      companyId: job.companyId,
      expiresAt: job.expiresAt
    }
  })));

  return { expiredCount: overdueJobs.length };
};

/**
 * Get personalized job recommendations for a candidate.
 * Scoring: skill overlap (60%), location match (20%), recency (20%).
 */
export const getRecommendations = async (userId, limit = 10) => {
  const [CandidateProfile, Application, SavedJob, AssessmentResult] = await Promise.all([
    import('../models/CandidateProfile.js').then(m => m.default),
    import('../models/Application.js').then(m => m.default),
    import('../models/SavedJob.js').then(m => m.default),
    import('../models/AssessmentResult.js').then(m => m.default)
  ]);

  // Get candidate's profile for skills and location
  const profile = await CandidateProfile.findOne({ userId }).lean();
  const candidateSkills = (profile?.skills || []).map(s => s.toLowerCase());
  const candidateLocation = profile?.location?.toLowerCase() || '';

  // Get already-applied and saved job IDs to exclude/boost
  const [appliedApps, savedDocs] = await Promise.all([
    Application.find({ candidateId: userId }).select('jobId').lean(),
    SavedJob.find({ userId }).select('jobId').lean()
  ]);
  const appliedJobIds = new Set(appliedApps.map(a => a.jobId.toString()));
  const savedJobIds = new Set(savedDocs.map(s => s.jobId.toString()));

  // Get badge skills from assessments
  const badges = await AssessmentResult.find({ userId, passed: true }).select('assessmentId').lean();
  const badgeSkills = new Set();

  if (badges.length > 0) {
    const SkillAssessment = (await import('../models/SkillAssessment.js')).default;
    const assessments = await SkillAssessment.find({
      _id: { $in: badges.map(b => b.assessmentId) }
    }).select('skill').lean();
    assessments.forEach(a => { if (a.skill) badgeSkills.add(a.skill.toLowerCase()); });
  }

  // Fetch active jobs not already applied to
  const jobs = await Job.find({
    status: 'active',
    expiresAt: { $gte: new Date() }
  }).populate('companyId', 'name logo').lean();

  // Score each job
  const scored = jobs
    .filter(j => !appliedJobIds.has(j._id.toString()))
    .map(job => {
      let score = 0;
      const reasons = [];
      const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());

      // Skill overlap (0-60 points)
      const matchedSkills = jobSkills.filter(s => candidateSkills.includes(s));
      const badgeMatchedSkills = jobSkills.filter(s => badgeSkills.has(s));
      const skillRatio = jobSkills.length ? matchedSkills.length / jobSkills.length : 0;
      const skillScore = Math.round(skillRatio * 50);
      const badgeBonus = Math.min(badgeMatchedSkills.length * 5, 10);
      score += skillScore + badgeBonus;
      if (matchedSkills.length) reasons.push(`${matchedSkills.length} skill${matchedSkills.length > 1 ? 's' : ''} match`);
      if (badgeMatchedSkills.length) reasons.push(`${badgeMatchedSkills.length} verified badge${badgeMatchedSkills.length > 1 ? 's' : ''}`);

      // Location match (0-20 points)
      const jobLocation = (job.location || '').toLowerCase();
      if (candidateLocation && jobLocation.includes(candidateLocation)) {
        score += 20;
        reasons.push('Location match');
      } else if (job.locationType === 'remote') {
        score += 15;
        reasons.push('Remote friendly');
      }

      // Recency bonus (0-20 points — newer jobs score higher)
      const ageInDays = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, Math.round(20 - ageInDays));
      score += recencyScore;

      // Saved job boost (+5)
      if (savedJobIds.has(job._id.toString())) {
        score += 5;
        reasons.push('You saved this job');
      }

      return {
        ...job,
        matchScore: Math.min(score, 100),
        matchPercentage: Math.min(score, 100),
        matchReasons: reasons
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

