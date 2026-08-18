import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as scheduledInterviewController from '../controllers/scheduledInterviewController.js';

const router = Router();
router.use(protect);

router.get('/', scheduledInterviewController.listInterviews);
router.get('/calendar', scheduledInterviewController.getCalendarView);
router.post('/', authorizeRoles('recruiter', 'admin'), scheduledInterviewController.scheduleInterview);
router.put('/:id', scheduledInterviewController.updateInterview);
router.patch('/:id/cancel', scheduledInterviewController.cancelInterview);

export default router;
