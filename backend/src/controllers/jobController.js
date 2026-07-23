import asyncHandler from '../utils/asyncHandler.js';
import * as jobService from '../services/jobService.js';
import { jobQuerySchema } from '../validations/jobValidation.js';
import ApiError from '../utils/apiError.js';

const getRequestContext = (req) => ({ ipAddress: req.ip, userAgent: req.get('user-agent') || '' });

/**
 * @route   POST /api/v1/jobs
 * @access  Authenticated (Recruiter)
 */
export const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Job posting created successfully',
    data: { job }
  });
});

/**
 * @route   GET /api/v1/jobs
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  // Validate and coerce query parameters
  const queryResult = jobQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const details = queryResult.error.issues.map((issue) => issue.message);
    throw new ApiError(400, 'Invalid query parameters', true);
  }

  const result = await jobService.getJobs(queryResult.data);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
export const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);

  res.status(200).json({
    success: true,
    data: { job }
  });
});

/**
 * @route   PUT /api/v1/jobs/:id
 * @access  Authenticated (Recruiter — owner only)
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Job updated successfully',
    data: { job }
  });
});

/**
 * @route   DELETE /api/v1/jobs/:id
 * @access  Authenticated (Recruiter — owner only)
 */
export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Job archived successfully'
  });
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await jobService.closeJob(req.params.id, req.user.id, req.user.role, getRequestContext(req));
  res.status(200).json({ success: true, message: 'Job posting closed successfully', data: { job } });
});

export const reopenJob = asyncHandler(async (req, res) => {
  const job = await jobService.reopenJob(req.params.id, req.user.id, req.user.role, req.body, getRequestContext(req));
  res.status(200).json({ success: true, message: 'Job posting reopened successfully', data: { job } });
});
