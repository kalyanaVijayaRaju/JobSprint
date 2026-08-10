import Company from '../models/Company.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import CompanyFollower from '../models/CompanyFollower.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
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
  const { page, limit, sortBy, sortOrder, industry, size, isVerified, search } = query;

  const filter = {};

  if (industry) {
    filter.industry = { $regex: industry, $options: 'i' };
  }

  if (size) {
    filter.size = size;
  }

  if (isVerified !== undefined) {
    filter.isVerified = isVerified;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

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

// ---------------------------------------------------------------------------
// New: Company detail, company jobs, follow/unfollow
// ---------------------------------------------------------------------------

/**
 * Get enriched company detail with follower count, active job count,
 * and total applications received.
 *
 * @param {string} companyId
 * @param {string|null} userId - If provided, includes whether this user follows the company
 * @returns {Object} Enriched company detail
 */
export const getCompanyDetail = async (companyId, userId = null) => {
  const company = await Company.findById(companyId).lean();

  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  const [activeJobCount, totalApplications, followerCount, isFollowing] = await Promise.all([
    Job.countDocuments({ companyId, status: 'active', expiresAt: { $gt: new Date() } }),

    Job.aggregate([
      { $match: { companyId: company._id } },
      { $lookup: { from: 'applications', localField: '_id', foreignField: 'jobId', as: 'apps' } },
      { $project: { appCount: { $size: '$apps' } } },
      { $group: { _id: null, total: { $sum: '$appCount' } } }
    ]).then((rows) => rows[0]?.total || 0),

    CompanyFollower.countDocuments({ companyId }),

    userId
      ? CompanyFollower.exists({ companyId, userId }).then(Boolean)
      : false
  ]);

  return {
    ...company,
    activeJobCount,
    totalApplications,
    followerCount,
    isFollowing
  };
};

/**
 * Get paginated jobs for a specific company.
 *
 * @param {string} companyId
 * @param {Object} query - { page, limit, status }
 * @returns {{ jobs: Array, pagination: Object }}
 */
export const getCompanyJobs = async (companyId, query) => {
  const company = await Company.findById(companyId).lean();
  if (!company) throw new ApiError(404, 'Company not found');

  const { page = 1, limit = 10, status = 'active' } = query;
  const filter = { companyId: company._id, status };

  if (status === 'active') {
    filter.expiresAt = { $gt: new Date() };
  }

  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('companyId', 'name logo')
      .lean(),
    Job.countDocuments(filter)
  ]);

  return {
    jobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total,
      limit
    }
  };
};

/**
 * Follow a company. Idempotent — silently succeeds if already following.
 *
 * @param {string} userId
 * @param {string} companyId
 * @returns {{ followed: boolean, followerCount: number }}
 */
export const followCompany = async (userId, companyId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, 'Company not found');

  try {
    await CompanyFollower.create({ userId, companyId });
  } catch (err) {
    // Duplicate key = already following — idempotent success
    if (err.code !== 11000) throw err;
  }

  const followerCount = await CompanyFollower.countDocuments({ companyId });
  return { followed: true, followerCount };
};

/**
 * Unfollow a company.
 *
 * @param {string} userId
 * @param {string} companyId
 * @returns {{ followed: boolean, followerCount: number }}
 */
export const unfollowCompany = async (userId, companyId) => {
  await CompanyFollower.deleteOne({ userId, companyId });
  const followerCount = await CompanyFollower.countDocuments({ companyId });
  return { followed: false, followerCount };
};

