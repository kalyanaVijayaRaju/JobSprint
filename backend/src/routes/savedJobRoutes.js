import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  saveJob,
  unsaveJob,
  getSavedJobs
} from '../controllers/savedJobController.js';

const router = express.Router();

// All saved-jobs routes are candidate-only

// List all saved/bookmarked jobs
router.get(
  '/',
  protect,
  authorizeRoles('candidate'),
  getSavedJobs
);

// Save/bookmark a job
router.post(
  '/:jobId',
  protect,
  authorizeRoles('candidate'),
  saveJob
);

// Unsave/remove a bookmarked job
router.delete(
  '/:jobId',
  protect,
  authorizeRoles('candidate'),
  unsaveJob
);

export default router;
