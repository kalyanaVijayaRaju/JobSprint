import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as activityFeedController from '../controllers/activityFeedController.js';

const router = Router();

router.get('/public', activityFeedController.getPublicFeed);

router.use(protect);
router.get('/me', activityFeedController.getUserTimeline);
router.get('/stats', activityFeedController.getUserActivityStats);

export default router;
