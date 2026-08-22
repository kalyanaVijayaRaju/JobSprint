import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as aiAnalyzerController from '../controllers/aiAnalyzerController.js';

const router = Router();
router.use(protect);

router.post('/match', aiAnalyzerController.analyzeMatch);
router.post('/score-resume', aiAnalyzerController.scoreResume);

export default router;
