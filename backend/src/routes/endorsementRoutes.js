import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as endorsementController from '../controllers/endorsementController.js';

const router = Router();

router.get('/:userId', endorsementController.getEndorsements);
router.get('/:userId/top-skills', endorsementController.getTopSkills);

router.use(protect);
router.post('/', endorsementController.endorseSkill);
router.delete('/:id', endorsementController.retractEndorsement);

export default router;
