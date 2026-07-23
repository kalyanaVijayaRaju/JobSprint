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
