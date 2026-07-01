import asyncHandler from '../utils/asyncHandler.js';
import * as savedJobService from '../services/savedJobService.js';
import { savedJobQuerySchema } from '../validations/savedJobValidation.js';
import ApiError from '../utils/apiError.js';

/**
 * @route   POST /api/v1/saved-jobs/:jobId
 * @access  Authenticated (Candidate)
 */
export const saveJob = asyncHandler(async (req, res) => {
  const savedJob = await savedJobService.saveJob(req.user.id, req.params.jobId);

  res.status(201).json({
    success: true,
    message: 'Job saved successfully',
    data: { savedJob }
  });
});

/**
 * @route   DELETE /api/v1/saved-jobs/:jobId
 * @access  Authenticated (Candidate)
 */
export const unsaveJob = asyncHandler(async (req, res) => {
  await savedJobService.unsaveJob(req.user.id, req.params.jobId);

  res.status(200).json({
    success: true,
    message: 'Job removed from saved list'
  });
});

/**
 * @route   GET /api/v1/saved-jobs
 * @access  Authenticated (Candidate)
 */
export const getSavedJobs = asyncHandler(async (req, res) => {
  const queryResult = savedJobQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = queryResult.error.issues.map((issue) => issue.message);
    throw error;
  }

  const result = await savedJobService.getSavedJobs(
    req.user.id,
    queryResult.data
  );

  res.status(200).json({
    success: true,
    data: result
  });
});
