import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import {
  applySchema,
  updateStatusSchema,
  addNoteSchema,
  scheduleInterviewSchema,
  updateInterviewSchema
} from '../validations/applicationValidation.js';
import {
  applyToJob,
  getMyApplications,
  getApplicationSummary,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  addRecruiterNote,
  scheduleInterview,
  updateInterview,
  getApplicationInterviews
} from '../controllers/applicationController.js';

const router = express.Router();

// Role-aware dashboard totals for candidates and recruiters
router.get(
  '/summary',
  protect,
  authorizeRoles('candidate', 'recruiter'),
  getApplicationSummary
);

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

// Withdraw one of the candidate's own applications
router.patch(
  '/:id/withdraw',
  protect,
  authorizeRoles('candidate'),
  withdrawApplication
);

// Candidates can view only their own interviews; recruiters view interviews
// for jobs they own. The service enforces ownership for both roles.
router.get(
  '/:id/interviews',
  protect,
  authorizeRoles('candidate', 'recruiter', 'admin'),
  getApplicationInterviews
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

router.post(
  '/:id/interviews',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(scheduleInterviewSchema),
  scheduleInterview
);

router.patch(
  '/:id/interviews/:interviewId',
  protect,
  authorizeRoles('recruiter', 'admin'),
  validate(updateInterviewSchema),
  updateInterview
);

export default router;
