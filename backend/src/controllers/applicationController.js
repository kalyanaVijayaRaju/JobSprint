import asyncHandler from '../utils/asyncHandler.js';
import * as applicationService from '../services/applicationService.js';
import {
  applicationQuerySchema,
  jobApplicationsQuerySchema
} from '../validations/applicationValidation.js';
import ApiError from '../utils/apiError.js';

/**
 * @route   POST /api/v1/applications/:jobId/apply
 * @access  Authenticated (Candidate)
 */
export const applyToJob = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToJob(
    req.user.id,
    req.params.jobId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application }
  });
});

/**
 * @route   GET /api/v1/applications/my-applications
 * @access  Authenticated (Candidate)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const queryResult = applicationQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = queryResult.error.issues.map((issue) => issue.message);
    throw error;
  }

  const result = await applicationService.getCandidateApplications(
    req.user.id,
    queryResult.data
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   GET /api/v1/applications/summary
 * @access  Authenticated (Candidate or Recruiter)
 */
export const getApplicationSummary = asyncHandler(async (req, res) => {
  const summary = await applicationService.getApplicationSummary(
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: { summary }
  });
});

/**
 * @route   GET /api/v1/applications/job/:jobId
 * @access  Authenticated (Recruiter — owner of the job)
 */
export const getJobApplications = asyncHandler(async (req, res) => {
  const queryResult = jobApplicationsQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = queryResult.error.issues.map((issue) => issue.message);
    throw error;
  }

  const result = await applicationService.getJobApplications(
    req.params.jobId,
    req.user.id,
    queryResult.data
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Authenticated (Recruiter — owner of the job)
 */
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.user.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: {
      applicationId: application._id,
      status: application.status
    }
  });
});

/**
 * @route   POST /api/v1/applications/:id/notes
 * @access  Authenticated (Recruiter — owner of the job)
 */
export const addRecruiterNote = asyncHandler(async (req, res) => {
  const application = await applicationService.addRecruiterNote(
    req.params.id,
    req.user.id,
    req.body.note
  );

  res.status(201).json({
    success: true,
    message: 'Note added successfully',
    data: {
      notes: application.recruiterNotes
    }
  });
});
