import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import CandidateProfile from '../models/CandidateProfile.js';
import ApiError from '../utils/apiError.js';
import * as notificationService from './notificationService.js';
import logger from '../utils/logger.js';

const APPLICATION_STATUSES = ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'];

const normalizeStatusCounts = (rows) => {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status, 0]));
  rows.forEach(({ _id, count }) => {
    if (_id in counts)
      counts[_id] = count;
  });
  return counts;
};

/**
 * Return authoritative dashboard totals without depending on paginated lists.
 * Candidates see their own pipeline; recruiters see applications across jobs
 * they own. Empty stages are always represented with a zero value.
 */
export const getApplicationSummary = async (userId, role) => {
  let filter;
  let totalJobs = null;

  if (role === 'candidate') {
    filter = { candidateId: new mongoose.Types.ObjectId(userId) };
  } else {
    const ownedJobs = await Job.find({ recruiterId: userId }).select('_id').lean();
    const jobIds = ownedJobs.map(({ _id }) => _id);
    filter = { jobId: { $in: jobIds } };
    totalJobs = ownedJobs.length;
  }

  const [statusRows, total] = await Promise.all([
    Application.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.countDocuments(filter)
  ]);

  const byStatus = normalizeStatusCounts(statusRows);

  return {
    total,
    byStatus,
    ...(role === 'recruiter' && {
      totalJobs,
      activePipeline: byStatus.screening + byStatus.interviewing,
      offerRate: total > 0 ? Math.round((byStatus.offered / total) * 100) : 0
    })
  };
};

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

  // Trigger in-app notification to the candidate
  try {
    const title = 'Application Status Updated';
    const message = `Your application for the position "${job.title}" has been moved to status: ${newStatus}.`;
    await notificationService.createNotification(application.candidateId, title, message, 'application_status');
  } catch (err) {
    logger.error(`Failed to create notification for user ${application.candidateId}: ${err.message}`);
  }

  return updated;
};

/**
 * Withdraw a candidate's own application from an active hiring pipeline.
 * Rejected or already-withdrawn applications are immutable from the
 * candidate side so the application history stays audit-friendly.
 *
 * @param {string} applicationId - Target application ObjectId
 * @param {string} candidateId   - Authenticated candidate user ID
 * @returns {Object} The updated application document
 */
export const withdrawApplication = async (applicationId, candidateId) => {
  const application = await Application.findOne({
    _id: applicationId,
    candidateId
  });

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.status === 'withdrawn') {
    throw new ApiError(400, 'Application has already been withdrawn');
  }

  if (application.status === 'rejected') {
    throw new ApiError(400, 'Rejected applications cannot be withdrawn');
  }

  return application.updateStatus('withdrawn', candidateId);
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

const getRecruiterApplication = async (applicationId, actorId, actorRole) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  const job = await Job.findById(application.jobId);
  if (!job || (actorRole !== 'admin' && job.recruiterId.toString() !== actorId)) {
    throw new ApiError(403, 'You can only manage interviews for your own job postings');
  }

  return { application, job };
};

/**
 * Schedule an interview and move an eligible application into the
 * interviewing pipeline stage. Candidates receive an in-app notification.
 */
export const scheduleInterview = async (applicationId, actorId, actorRole, data) => {
  const { application, job } = await getRecruiterApplication(applicationId, actorId, actorRole);

  if (['withdrawn', 'rejected', 'offered'].includes(application.status)) {
    throw new ApiError(400, `Cannot schedule an interview for a ${application.status} application`);
  }

  if (application.status !== 'interviewing') {
    await application.updateStatus('interviewing', actorId);
  }

  application.interviews.push({
    ...data,
    scheduledAt: new Date(data.scheduledAt),
    createdBy: actorId,
    updatedBy: actorId
  });
  await application.save();

  const interview = application.interviews.at(-1);
  try {
    await notificationService.createNotification(
      application.candidateId,
      'Interview Scheduled',
      `An interview for "${job.title}" is scheduled for ${interview.scheduledAt.toISOString()}.`,
      'application_status'
    );
  } catch (err) {
    logger.error(`Failed to create interview notification for user ${application.candidateId}: ${err.message}`);
  }

  return { application, interview };
};

/** Update, reschedule, complete, or cancel an existing interview. */
export const updateInterview = async (applicationId, interviewId, actorId, actorRole, data) => {
  const { application, job } = await getRecruiterApplication(applicationId, actorId, actorRole);
  const interview = application.interviews.id(interviewId);

  if (!interview) {
    throw new ApiError(404, 'Interview not found');
  }

  if (['completed', 'cancelled'].includes(interview.status)) {
    throw new ApiError(400, `A ${interview.status} interview cannot be changed`);
  }

  Object.assign(interview, data.scheduledAt ? { ...data, scheduledAt: new Date(data.scheduledAt) } : data, { updatedBy: actorId });
  await application.save();

  const action = interview.status === 'cancelled' ? 'cancelled' : interview.status === 'completed' ? 'completed' : 'updated';
  try {
    await notificationService.createNotification(
      application.candidateId,
      `Interview ${action.charAt(0).toUpperCase()}${action.slice(1)}`,
      `Your interview for "${job.title}" has been ${action}.${interview.status === 'scheduled' ? ` Scheduled for ${interview.scheduledAt.toISOString()}.` : ''}`,
      'application_status'
    );
  } catch (err) {
    logger.error(`Failed to create interview notification for user ${application.candidateId}: ${err.message}`);
  }

  return interview;
};

/** Return interviews only to the application candidate or the job owner. */
export const getApplicationInterviews = async (applicationId, actorId, actorRole) => {
  const application = await Application.findById(applicationId).lean();
  if (!application) throw new ApiError(404, 'Application not found');

  if (actorRole === 'candidate') {
    if (application.candidateId.toString() !== actorId) throw new ApiError(403, 'You can only view your own interviews');
  } else if (actorRole !== 'admin') {
    const job = await Job.findById(application.jobId).select('recruiterId').lean();
    if (!job || job.recruiterId.toString() !== actorId) throw new ApiError(403, 'You can only view interviews for your own job postings');
  }

  return application.interviews.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
};

/** Candidate accepts or declines their own scheduled interview. */
export const respondToInterview = async (applicationId, interviewId, candidateId, data) => {
  const application = await Application.findOne({ _id: applicationId, candidateId });
  if (!application) throw new ApiError(404, 'Application not found');

  const interview = application.interviews.id(interviewId);
  if (!interview) throw new ApiError(404, 'Interview not found');
  if (interview.status !== 'scheduled') throw new ApiError(400, 'Only scheduled interviews can be answered');
  if (interview.candidateResponse !== 'pending') throw new ApiError(400, 'Interview has already been answered');

  interview.candidateResponse = data.response;
  interview.candidateResponseNote = data.note;
  interview.respondedAt = new Date();
  interview.updatedBy = candidateId;
  await application.save();

  const job = await Job.findById(application.jobId).select('title recruiterId').lean();
  try {
    await notificationService.createNotification(
      job.recruiterId,
      `Interview ${data.response === 'accepted' ? 'Accepted' : 'Declined'}`,
      `The candidate ${data.response} the interview for "${job.title}".${data.note ? ` Note: ${data.note}` : ''}`,
      'application_status'
    );
  } catch (err) {
    logger.error(`Failed to create recruiter interview-response notification for job ${application.jobId}: ${err.message}`);
  }

  return interview;
};

const toCalendarItem = (application, interview, includeCandidate) => ({
  interviewId: interview._id,
  applicationId: application._id,
  scheduledAt: interview.scheduledAt,
  durationMinutes: interview.durationMinutes,
  meetingType: interview.meetingType,
  location: interview.location,
  meetingUrl: interview.meetingUrl,
  timezone: interview.timezone,
  instructions: interview.instructions,
  status: interview.status,
  candidateResponse: interview.candidateResponse,
  candidateResponseNote: interview.candidateResponseNote,
  respondedAt: interview.respondedAt,
  job: {
    id: application.jobId._id,
    title: application.jobId.title,
    company: application.jobId.companyId ? {
      id: application.jobId.companyId._id,
      name: application.jobId.companyId.name,
      logo: application.jobId.companyId.logo
    } : null
  },
  ...(includeCandidate && {
    candidate: { id: application.candidateId._id, email: application.candidateId.email }
  })
});

const listInterviewCalendar = async (applicationFilter, query, includeCandidate) => {
  const from = query.from ? new Date(query.from) : new Date();
  const to = query.to ? new Date(query.to) : null;
  const interviewFilter = {
    status: query.status,
    scheduledAt: { $gte: from, ...(to && { $lte: to }) },
    ...(query.meetingType && { meetingType: query.meetingType })
  };
  const applications = await Application.find({
    ...applicationFilter,
    interviews: { $elemMatch: interviewFilter }
  })
    .populate({
      path: 'jobId',
      select: 'title companyId',
      populate: { path: 'companyId', select: 'name logo' }
    })
    .populate('candidateId', 'email')
    .lean();

  const interviews = applications
    .flatMap((application) => application.interviews
      .filter((interview) => interview.status === query.status
        && new Date(interview.scheduledAt) >= from
        && (!to || new Date(interview.scheduledAt) <= to)
        && (!query.meetingType || interview.meetingType === query.meetingType))
      .map((interview) => toCalendarItem(application, interview, includeCandidate)))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const start = (query.page - 1) * query.limit;
  return {
    interviews: interviews.slice(start, start + query.limit),
    pagination: {
      currentPage: query.page,
      totalPages: Math.ceil(interviews.length / query.limit),
      totalInterviews: interviews.length,
      limit: query.limit
    }
  };
};

/** Calendar feed containing interviews for a recruiter's own postings. */
export const getRecruiterInterviewCalendar = async (recruiterId, query) => {
  const jobs = await Job.find({ recruiterId }).select('_id').lean();
  return listInterviewCalendar({ jobId: { $in: jobs.map((job) => job._id) } }, query, true);
};

/** Candidate-safe calendar feed containing only the user's own interviews. */
export const getCandidateInterviewCalendar = async (candidateId, query) => {
  return listInterviewCalendar({ candidateId }, query, false);
};
