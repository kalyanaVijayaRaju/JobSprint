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

/**
 * @route   GET /api/v1/companies/:id/detail
 * @access  Public (enriched with follow status if authenticated)
 */
export const getCompanyDetail = asyncHandler(async (req, res) => {
  const userId = req.user?.id || null;
  const company = await companyService.getCompanyDetail(req.params.id, userId);

  res.status(200).json({
    success: true,
    data: { company }
  });
});

/**
 * @route   GET /api/v1/companies/:id/jobs
 * @access  Public
 */
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const query = {
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 10,
    status: req.query.status || 'active'
  };
  const result = await companyService.getCompanyJobs(req.params.id, query);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @route   POST /api/v1/companies/:id/follow
 * @access  Authenticated
 */
export const followCompany = asyncHandler(async (req, res) => {
  const result = await companyService.followCompany(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Company followed successfully',
    data: result
  });
});

/**
 * @route   DELETE /api/v1/companies/:id/follow
 * @access  Authenticated
 */
export const unfollowCompany = asyncHandler(async (req, res) => {
  const result = await companyService.unfollowCompany(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Company unfollowed successfully',
    data: result
  });
});
