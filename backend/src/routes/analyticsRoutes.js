import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  getPlatformAnalytics,
  getRecruiterAnalytics,
  getCandidateAnalytics,
  getTrends
} from '../controllers/analyticsController.js';

const router = Router();

// All analytics routes require authentication
router.use(protect);

// Admin-only platform analytics
router.get('/platform', authorizeRoles('admin'), getPlatformAnalytics);

// Admin-only trend data for charts
router.get('/trends', authorizeRoles('admin'), getTrends);

// Recruiter-specific analytics
router.get('/recruiter', authorizeRoles('recruiter'), getRecruiterAnalytics);

// Candidate-specific analytics
router.get('/candidate', authorizeRoles('candidate'), getCandidateAnalytics);

export default router;
