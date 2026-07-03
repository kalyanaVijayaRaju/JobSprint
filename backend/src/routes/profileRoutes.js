import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import { candidateProfileSchema, recruiterProfileSchema } from '../validations/profileValidation.js';
import { getProfile, upsertProfile, uploadResume } from '../controllers/profileController.js';
import { handleResumeUpload } from '../utils/upload.js';

const router = express.Router();

/**
 * Profile validation middleware that selects the correct schema based on
 * the authenticated user's role.
 */
const validateProfile = (req, res, next) => {
  const schema = req.user.role === 'recruiter'
    ? recruiterProfileSchema
    : candidateProfileSchema;

  return validate(schema)(req, res, next);
};

// All profile routes require authentication
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateProfile, upsertProfile);
router.post('/resume/upload', protect, authorizeRoles('candidate'), handleResumeUpload, uploadResume);

export default router;
