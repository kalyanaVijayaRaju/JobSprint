import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { createJobAlertSchema } from '../validations/jobAlertValidation.js';
import * as jobAlertService from '../services/jobAlertService.js';

export const createAlert = asyncHandler(async (req, res) => {
  const result = createJobAlertSchema.safeParse(req.body);

  if (!result.success) {
    const error = new ApiError(400, 'Invalid alert payload parameters', true);
    error.details = result.error.issues.map((issue) => issue.message);
    throw error;
  }

  const alert = await jobAlertService.createAlert(req.user.id, result.data);

  res.status(201).json({
    success: true,
    message: 'Job alert subscription created successfully',
    data: { alert }
  });
});

export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await jobAlertService.listAlerts(req.user.id);

  res.status(200).json({
    success: true,
    data: { alerts }
  });
});

export const deleteAlert = asyncHandler(async (req, res) => {
  await jobAlertService.deleteAlert(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Job alert subscription deleted successfully'
  });
});
