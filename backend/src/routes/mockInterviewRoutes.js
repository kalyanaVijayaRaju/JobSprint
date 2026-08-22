import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as mockInterviewController from '../controllers/mockInterviewController.js';

const router = Router();
router.use(protect);

router.post('/start', mockInterviewController.startInterview);
router.post('/:id/answer', mockInterviewController.answerQuestion);
router.post('/:id/finish', mockInterviewController.finishInterview);
router.get('/history', mockInterviewController.getHistory);

export default router;
