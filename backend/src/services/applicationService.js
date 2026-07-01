import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import ApiError from '../utils/apiError.js';

/**
 * Submit a job application.
 *
 * Business rules enforced:
 *  1. The job must exist and be active (not expired).
 *  2. The candidate must have a completed profile with a resume on file.
 *  3. A candidate cannot apply to the same job twice (DB unique index).
 *
 * @param {string} candidateId - Authenticated user's ID
 * @param {string} jobId       - Target job ObjectId
 * @param {Object} data        - Validated body ({ coverLetter? })
 * @returns {Object} The created application document
 */
export const applyToJob = async (candidateId, jobId, data) => {
  // 1. Verify job exists and is still accepting applications
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.status !== 'active') {
    throw new ApiError(400, 'This job is no longer accepting applications');
  }

  if (job.expiresAt && new Date(job.expiresAt) <= new Date()) {
    throw new ApiError(400, 'This job posting has expired');
  }

  // 2. Verify candidate has a profile with a resume
  const profile = await CandidateProfile.findOne({ userId: candidateId });

  if (!profile) {
    throw new ApiError(400, 'Please complete your profile before applying');
  }

  if (!profile.resumeUrl) {
    throw new ApiError(400, 'Please upload a resume before applying');
  }

  // 3. Check for duplicate application (also enforced at DB level)
  const existingApplication = await Application.findOne({
    jobId,
    candidateId
  });

  if (existingApplication) {
    throw new ApiError(409, 'You have already applied to this job');
  }

  // 4. Create application with a snapshot of the current resume URL
  const application = await Application.create({
    jobId,
    candidateId,
    resumeUrl: profile.resumeUrl,
    coverLetter: data.coverLetter || '',
    status: 'applied'
  });

  return application;
};

/**
 * List a candidate's own applications with pagination and optional
 * status filtering.  Includes populated job details (title, company, location).
 *
 * @param {string} candidateId - Authenticated user's ID
 * @param {Object} query       - Parsed query parameters
 * @returns {{ applications: Array, pagination: Object }}
 */
export const getCandidateApplications = async (candidateId, query) => {
  const { page, limit, status, sortBy, sortOrder } = query;

  const filter = { candidateId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'jobId',
        select: 'title location locationType jobType salaryRange status companyId',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      })
      .lean(),
    Application.countDocuments(filter)
  ]);

  return {
    applications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      limit
    }
  };
};

/**
 * List all applications for a specific job.  Only the recruiter who owns
 * the job may call this.
 *
 * @param {string} jobId       - Target job ObjectId
 * @param {string} recruiterId - Authenticated recruiter's user ID
 * @param {Object} query       - Parsed query parameters
 * @returns {{ applications: Array, pagination: Object }}
 */
export const getJobApplications = async (jobId, recruiterId, query) => {
  // Verify the recruiter owns this job
  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.recruiterId.toString() !== recruiterId) {
    throw new ApiError(403, 'You can only view applications for your own job postings');
  }

  const { page, limit, status, sortBy, sortOrder } = query;

  const filter = { jobId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'candidateId',
        select: 'email'
      })
      .lean(),
    Application.countDocuments(filter)
  ]);

  return {
    applications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      limit
    }
  };
};

/**
 * Update an application's pipeline status.  Only the recruiter who
 * owns the associated job may perform this action.  The Application
 * model's pre-save hook automatically logs the transition in the
 * statusTimeline array.
 *
 * @param {string} applicationId - Target application ObjectId
 * @param {string} recruiterId   - Authenticated recruiter's user ID
 * @param {string} newStatus     - The new status value
 * @returns {Object} The updated application document
 */
export const updateApplicationStatus = async (applicationId, recruiterId, newStatus) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  // Verify the recruiter owns the job linked to this application
  const job = await Job.findById(application.jobId);

  if (!job || job.recruiterId.toString() !== recruiterId) {
    throw new ApiError(403, 'You can only update applications for your own job postings');
  }

  if (application.status === newStatus) {
    throw new ApiError(400, `Application is already in "${newStatus}" status`);
  }

  // updateStatus is an instance method on the Application model that
  // sets _updatedBy so the pre-save hook records the correct actor
  const updated = await application.updateStatus(newStatus, recruiterId);

  return updated;
};

/**
 * Add an internal recruiter note to an application.
 *
 * @param {string} applicationId - Target application ObjectId
 * @param {string} recruiterId   - Authenticated recruiter's user ID
 * @param {string} noteText      - The note content
 * @returns {Object} The updated application document
 */
export const addRecruiterNote = async (applicationId, recruiterId, noteText) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  // Verify the recruiter owns the job linked to this application
  const job = await Job.findById(application.jobId);

  if (!job || job.recruiterId.toString() !== recruiterId) {
    throw new ApiError(403, 'You can only add notes to applications for your own job postings');
  }

  application.recruiterNotes.push({
    note: noteText,
    createdBy: recruiterId,
    createdAt: new Date()
  });

  await application.save();

  return application;
};
