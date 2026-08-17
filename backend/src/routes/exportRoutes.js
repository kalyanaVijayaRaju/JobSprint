import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as exportController from '../controllers/exportController.js';

const router = Router();

router.use(protect);

router.get('/applications', exportController.exportApplications);
router.get('/analytics', exportController.exportAnalytics);
router.get('/hiring-summary', authorizeRoles('recruiter', 'admin'), exportController.getHiringSummaryReport);

export default router;
