import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as videoPitchController from '../controllers/videoPitchController.js';

const router = Router();
router.use(protect);

router.get('/', videoPitchController.getVideoPitches);
router.post('/', videoPitchController.createVideoPitch);
router.post('/:id/like', videoPitchController.likeVideoPitch);

export default router;
