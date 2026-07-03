import CandidateProfile from '../models/CandidateProfile.js';
import RecruiterProfile from '../models/RecruiterProfile.js';
import ApiError from '../utils/apiError.js';

/**
 * Get the candidate profile for a given user.
 *
 * @param {string} userId
 * @returns {Object|null} The candidate profile or null
 */
export const getCandidateProfile = async (userId) => {
  const profile = await CandidateProfile.findOne({ userId }).lean();
  return profile;
};

/**
 * Get the recruiter profile for a given user, populated with company data.
 *
 * @param {string} userId
 * @returns {Object|null} The recruiter profile or null
 */
export const getRecruiterProfile = async (userId) => {
  const profile = await RecruiterProfile.findOne({ userId })
    .populate('companyId', 'name logo website description industry size')
    .lean();
  return profile;
};

/**
 * Create or update a candidate profile.
 *
 * Uses findOneAndUpdate with upsert to handle both creation and updates
 * in a single atomic operation.
 *
 * @param {string} userId
 * @param {Object} data - Validated profile fields
 * @returns {Object} The upserted profile
 */
export const upsertCandidateProfile = async (userId, data) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId },
    { $set: { ...data, userId } },
    { new: true, upsert: true, runValidators: true }
  );

  return profile;
};

/**
 * Create or update a recruiter profile.
 *
 * @param {string} userId
 * @param {Object} data - Validated profile fields
 * @returns {Object} The upserted profile
 */
export const upsertRecruiterProfile = async (userId, data) => {
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId },
    { $set: { ...data, userId } },
    { new: true, upsert: true, runValidators: true }
  );

  return profile;
};

/**
 * Get a profile based on the user's role, dispatching to the correct model.
 *
 * @param {string} userId
 * @param {string} role - 'candidate' or 'recruiter'
 * @returns {Object} The user's profile (or throws if not found)
 */
export const getProfileByRole = async (userId, role) => {
  let profile;

  if (role === 'candidate') {
    profile = await getCandidateProfile(userId);
  } else if (role === 'recruiter') {
    profile = await getRecruiterProfile(userId);
  } else {
    throw new ApiError(400, 'Profile management is not available for this role');
  }

  if (!profile) {
    throw new ApiError(404, 'Profile not found. Please create your profile first.');
  }

  return profile;
};

/**
 * Upsert a profile based on the user's role, dispatching to the correct model.
 *
 * @param {string} userId
 * @param {string} role
 * @param {Object} data
 * @returns {Object} The upserted profile
 */
export const upsertProfileByRole = async (userId, role, data) => {
  if (role === 'candidate') {
    return upsertCandidateProfile(userId, data);
  } else if (role === 'recruiter') {
    return upsertRecruiterProfile(userId, data);
  }

  throw new ApiError(400, 'Profile management is not available for this role');
};

/**
 * Update the candidate's resume URL.
 *
 * @param {string} userId
 * @param {string} resumeUrl
 * @returns {Object} The updated candidate profile
 */
export const updateCandidateResume = async (userId, resumeUrl) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId },
    { $set: { resumeUrl } },
    { new: true, upsert: true, runValidators: true }
  );

  return profile;
};
