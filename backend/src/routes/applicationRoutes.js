import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import {
  applySchema,
  updateStatusSchema,
  addNoteSchema
} from '../validations/applicationValidation.js';
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  addRecruiterNote
} from '../controllers/applicationController.js';

const router = express.Router();

// --- Candidate routes ---

// Submit an application to a job
router.post(
  '/:jobId/apply',
  protect,
  authorizeRoles('candidate'),
  validate(applySchema),
  applyToJob
);

// List the candidate's own applications
router.get(
  '/my-applications',
  protect,
  authorizeRoles('candidate'),
  getMyApplications
);

// --- Recruiter routes ---

// View all applications for a specific job posting
router.get(
  '/job/:jobId',
  protect,
  authorizeRoles('recruiter', 'admin'),
  getJobApplications
);

// Update an application's pipeline status
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(updateStatusSchema),
  updateApplicationStatus
);

// Add an internal recruiter note to an application
router.post(
  '/:id/notes',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(addNoteSchema),
  addRecruiterNote
);

export default router;
