import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as cultureMatchController from '../controllers/cultureMatchController.js';

const router = Router();
router.use(protect);

router.get('/', cultureMatchController.getCultureMatch);
router.post('/evaluate', cultureMatchController.evaluateCultureMatch);

export default router;
