import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as referralController from '../controllers/referralController.js';

const router = Router();
router.use(protect);

router.get('/', referralController.getReferrals);
router.post('/', referralController.requestReferral);

export default router;
