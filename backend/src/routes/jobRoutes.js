import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import { createJobSchema, updateJobSchema, reopenJobSchema } from '../validations/jobValidation.js';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  closeJob,
  reopenJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes — anyone can browse and view jobs
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes — only authenticated recruiters can manage jobs
router.post('/', protect, authorizeRoles('recruiter', 'admin'), validate(createJobSchema), createJob);
router.patch('/:id/close', protect, authorizeRoles('recruiter', 'admin'), closeJob);
router.patch('/:id/reopen', protect, authorizeRoles('recruiter', 'admin'), validate(reopenJobSchema), reopenJob);
router.put('/:id', protect, authorizeRoles('recruiter', 'admin'), validate(updateJobSchema), updateJob);
router.delete('/:id', protect, authorizeRoles('recruiter', 'admin'), deleteJob);

export default router;
