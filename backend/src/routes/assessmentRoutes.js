import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import * as assessmentController from '../controllers/assessmentController.js';

const router = Router();

// Public: list and get assessments
router.get('/', assessmentController.listAssessments);
router.get('/my-results', authenticate, assessmentController.getMyResults);
router.get('/my-badges', authenticate, assessmentController.getMyBadges);

// Admin: seed assessments
router.post('/seed', authenticate, authorize('admin'), assessmentController.seedAssessments);

// Get single assessment (public, no answers)
router.get('/:id', assessmentController.getAssessment);

// Submit assessment (authenticated candidates)
router.post('/:id/submit', authenticate, assessmentController.submitAssessment);

export default router;
