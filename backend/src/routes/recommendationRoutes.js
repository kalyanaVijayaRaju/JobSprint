import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as recommendationController from '../controllers/recommendationController.js';

const router = Router();

router.use(protect, authorizeRoles('candidate'));

router.get('/jobs', recommendationController.getRecommendedJobs);

export default router;
