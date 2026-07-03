import asyncHandler from '../utils/asyncHandler.js';
import { getProfileByRole, upsertProfileByRole, updateCandidateResume } from '../services/profileService.js';
import ApiError from '../utils/apiError.js';

/**
 * @route   GET /api/v1/users/profile
 * @access  Authenticated (Candidate / Recruiter)
 *
 * Automatically returns the correct profile type based on the
 * authenticated user's role.
 */
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await getProfileByRole(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: { profile }
  });
});

/**
 * @route   PUT /api/v1/users/profile
 * @access  Authenticated (Candidate / Recruiter)
 *
 * Creates the profile if it doesn't exist yet (upsert), or updates
 * it with the supplied fields.
 */
export const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await upsertProfileByRole(req.user.id, req.user.role, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { profile }
  });
});

/**
 * @route   POST /api/v1/users/resume/upload
 * @access  Authenticated (Candidate)
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;

  await updateCandidateResume(req.user.id, resumeUrl);

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: {
      resumeUrl
    }
  });
});
