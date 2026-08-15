import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as assessmentController from '../controllers/assessmentController.js';

const router = Router();

// Public: list and get assessments
router.get('/', assessmentController.listAssessments);
router.get('/my-results', protect, assessmentController.getMyResults);
router.get('/my-badges', protect, assessmentController.getMyBadges);

// Admin: seed assessments
router.post('/seed', protect, authorizeRoles('admin'), assessmentController.seedAssessments);

// Get single assessment (public, no answers)
router.get('/:id', assessmentController.getAssessment);

// Submit assessment (authenticated candidates)
router.post('/:id/submit', protect, assessmentController.submitAssessment);

export default router;
