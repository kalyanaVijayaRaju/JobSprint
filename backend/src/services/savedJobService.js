import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

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
  const {
    page,
    limit,
    search,
    location,
    locationType,
    jobType,
    status,
    sortBy,
    sortOrder
  } = query;

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const candidateObjectId = new mongoose.Types.ObjectId(candidateId);
  const jobFilters = {};

  if (status) {
    jobFilters['job.status'] = status;
  }

  if (locationType) {
    jobFilters['job.locationType'] = locationType;
  }

  if (jobType) {
    jobFilters['job.jobType'] = jobType;
  }

  if (location) {
    jobFilters['job.location'] = { $regex: location, $options: 'i' };
  }

  if (search) {
    jobFilters.$or = [
      { 'job.title': { $regex: search, $options: 'i' } },
      { 'job.description': { $regex: search, $options: 'i' } },
      { 'job.skillsRequired': { $regex: search, $options: 'i' } }
    ];
  }

  const basePipeline = [
    { $match: { candidateId: candidateObjectId } },
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' },
    ...(Object.keys(jobFilters).length > 0 ? [{ $match: jobFilters }] : []),
    {
      $lookup: {
        from: 'companies',
        localField: 'job.companyId',
        foreignField: '_id',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $set: {
        'job.companyId': {
          _id: '$company._id',
          name: '$company.name',
          logo: '$company.logo'
        }
      }
    },
    {
      $project: {
        company: 0,
        'job.recruiterId': 0,
        'job.requirements': 0,
        'job.__v': 0,
        __v: 0
      }
    }
  ];

  const [savedJobs, totalRows] = await Promise.all([
    SavedJob.aggregate([
      ...basePipeline,
      { $sort: { [sortBy]: sortDirection } },
      { $skip: skip },
      { $limit: limit },
      { $set: { jobId: '$job' } },
      { $project: { job: 0 } }
    ]),
    SavedJob.aggregate([
      ...basePipeline,
      { $count: 'total' }
    ])
  ]);

  const total = totalRows[0]?.total || 0;

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
