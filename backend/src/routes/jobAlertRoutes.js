import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createAlert,
  getAlerts,
  deleteAlert
} from '../controllers/jobAlertController.js';

const router = express.Router();

// Apply authentication to all job alerts routes
router.use(protect);

// Candidates only can configure custom alert subscriptions
router.post('/', authorizeRoles('candidate'), createAlert);
router.get('/', authorizeRoles('candidate'), getAlerts);
router.delete('/:id', authorizeRoles('candidate'), deleteAlert);

export default router;
