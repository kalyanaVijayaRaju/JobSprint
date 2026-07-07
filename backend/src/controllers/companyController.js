import asyncHandler from '../utils/asyncHandler.js';
import * as companyService from '../services/companyService.js';
import { companyQuerySchema } from '../validations/companyValidation.js';
import ApiError from '../utils/apiError.js';

/**
 * @route   POST /api/v1/companies
 * @access  Authenticated (Recruiter)
 */
export const createCompany = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Company created successfully',
    data: { company }
  });
});

/**
 * @route   GET /api/v1/companies
 * @access  Public
 */
export const getCompanies = asyncHandler(async (req, res) => {
  const queryResult = companyQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    const error = new ApiError(400, 'Invalid query parameters', true);
    error.details = queryResult.error.issues.map((issue) => issue.message);
    throw error;
  }

  const result = await companyService.getCompanies(queryResult.data);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   GET /api/v1/companies/:id
 * @access  Public
 */
export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);

  res.status(200).json({
    success: true,
    data: { company }
  });
});

/**
 * @route   PUT /api/v1/companies/:id
 * @access  Authenticated (Recruiter — linked to the company)
 */
export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Company updated successfully',
    data: { company }
  });
});

/**
 * @route   DELETE /api/v1/companies/:id
 * @access  Authenticated (Recruiter — linked to the company)
 */
export const deleteCompany = asyncHandler(async (req, res) => {
  await companyService.deleteCompany(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Company deactivated successfully'
  });
});
