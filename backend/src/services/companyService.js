import Company from '../models/Company.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import ApiError from '../utils/apiError.js';

/**
 * Create a new company and optionally link the recruiter's profile to it.
 *
 * If the recruiter already has a profile without a companyId, the newly
 * created company is linked automatically.  If the recruiter's profile
 * already references a different company, we skip the auto-link and let
 * the caller handle it.
 *
 * @param {string} recruiterId - The authenticated recruiter's user ID
 * @param {Object} data        - Validated company payload
 * @returns {Object} The created company document
 */
export const createCompany = async (recruiterId, data) => {
  // Guard against duplicate company names (case-insensitive)
  const existing = await Company.findByName(data.name);

  if (existing) {
    throw new ApiError(409, 'A company with this name already exists');
  }

  const company = await Company.create(data);

  // Auto-link the recruiter's profile to the new company when possible
  const recruiterProfile = await RecruiterProfile.findOne({ userId: recruiterId });

  if (recruiterProfile && !recruiterProfile.companyId) {
    recruiterProfile.companyId = company._id;
    await recruiterProfile.save();
  }

  return company;
};

/**
 * List companies with pagination and optional filters.
 *
 * @param {Object} query - Parsed and validated query parameters
 * @returns {{ companies: Array, pagination: Object }}
 */
export const getCompanies = async (query) => {
  const { page, limit, sortBy, sortOrder } = query;

  const filter = {};
  const skip = (page - 1) * limit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    Company.countDocuments(filter)
  ]);

  return {
    companies,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCompanies: total,
      limit
    }
  };
};

/**
 * Get a single company by its ID with populated job listings.
 *
 * @param {string} companyId
 * @returns {Object} The company document with virtual jobs
 */
export const getCompanyById = async (companyId) => {
  const company = await Company.findById(companyId)
    .populate({
      path: 'jobs',
      match: { status: 'active', expiresAt: { $gt: new Date() } },
      select: 'title location locationType jobType salaryRange createdAt',
      options: { sort: { createdAt: -1 }, limit: 20 }
    })
    .lean({ virtuals: true });

  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  return company;
};

/**
 * Update a company's details.
 *
 * Only the recruiter whose profile is linked to the company (or an admin)
 * may perform this operation.  Admin authorization is handled at the
 * route/controller level.
 *
 * @param {string} companyId    - Target company ObjectId
 * @param {string} recruiterId  - Authenticated recruiter's user ID
 * @param {Object} data         - Fields to update
 * @returns {Object} The updated company document
 */
export const updateCompany = async (companyId, recruiterId, data) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  // Verify the recruiter is linked to this company
  const recruiterProfile = await RecruiterProfile.findOne({
    userId: recruiterId,
    companyId: company._id
  });

  if (!recruiterProfile) {
    throw new ApiError(403, 'You can only update your own company');
  }

  // Prevent name collision on rename
  if (data.name && data.name !== company.name) {
    const nameConflict = await Company.findByName(data.name);
    if (nameConflict) {
      throw new ApiError(409, 'A company with this name already exists');
    }
  }

  Object.assign(company, data);
  await company.save();

  return company;
};

/**
 * Soft-delete a company by marking it as unverified.
 *
 * This does not remove the document — it simply hides it from verified
 * listings.  A hard-delete would cascade to jobs and applications, which
 * is too destructive for a user-facing action.
 *
 * @param {string} companyId   - Target company ObjectId
 * @param {string} recruiterId - Authenticated recruiter's user ID
 * @returns {Object} The deactivated company document
 */
export const deleteCompany = async (companyId, recruiterId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  // Verify the recruiter is linked to this company
  const recruiterProfile = await RecruiterProfile.findOne({
    userId: recruiterId,
    companyId: company._id
  });

  if (!recruiterProfile) {
    throw new ApiError(403, 'You can only delete your own company');
  }

  company.isVerified = false;
  await company.save();

  return company;
};
