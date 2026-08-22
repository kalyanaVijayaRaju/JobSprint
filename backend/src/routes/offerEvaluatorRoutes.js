import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as offerEvaluatorController from '../controllers/offerEvaluatorController.js';

const router = Router();
router.use(protect);

router.post('/evaluate', offerEvaluatorController.evaluateOffer);
router.get('/history', offerEvaluatorController.getHistory);

export default router;
