import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as interviewPrepController from '../controllers/interviewPrepController.js';

const router = Router();

// Public / Candidate endpoints
router.get('/questions', interviewPrepController.listQuestions);
router.get('/questions/:id', interviewPrepController.getQuestion);

// Protected endpoints
router.use(protect);

router.post('/questions/:id/practice', interviewPrepController.savePractice);
router.post('/questions/:id/favorite', interviewPrepController.toggleFavorite);
router.get('/history', interviewPrepController.getPracticeHistory);
router.get('/favorites', interviewPrepController.getFavorites);
router.get('/stats', interviewPrepController.getPracticeStats);

// Admin seed
router.post('/seed', authorizeRoles('admin'), interviewPrepController.seedQuestions);

export default router;
