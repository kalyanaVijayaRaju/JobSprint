import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import ApiError from '../utils/apiError.js';

/**
 * Toggle-save a job for a candidate.  If the job is already saved the
 * request is treated as idempotent and returns the existing record.
 *
 * @param {string} candidateId - Authenticated user's ID
 * @param {string} jobId       - Target job ObjectId
 * @returns {Object} The saved job record
 */
export const saveJob = async (candidateId, jobId) => {
  // Verify the job exists
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check if already saved (idempotent)
  const existing = await SavedJob.findOne({ candidateId, jobId });

  if (existing) {
    return existing;
  }

  const savedJob = await SavedJob.create({ candidateId, jobId });
  return savedJob;
};

/**
 * Remove a bookmarked job for a candidate.
 *
 * @param {string} candidateId - Authenticated user's ID
 * @param {string} jobId       - Target job ObjectId
 */
export const unsaveJob = async (candidateId, jobId) => {
  const result = await SavedJob.findOneAndDelete({ candidateId, jobId });

  if (!result) {
    throw new ApiError(404, 'Saved job not found');
  }
};

/**
 * List all saved jobs for a candidate with pagination.  Each entry is
 * populated with the full job details and its company info.
 *
 * @param {string} candidateId - Authenticated user's ID
 * @param {Object} query       - Parsed query parameters
 * @returns {{ savedJobs: Array, pagination: Object }}
 */
export const getSavedJobs = async (candidateId, query) => {
  const { page, limit, sortBy, sortOrder } = query;

  const filter = { candidateId };
  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [savedJobs, total] = await Promise.all([
    SavedJob.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'jobId',
        select: 'title description location locationType jobType salaryRange status expiresAt companyId createdAt',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      })
      .lean(),
    SavedJob.countDocuments(filter)
  ]);

  return {
    savedJobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSavedJobs: total,
      limit
    }
  };
};
