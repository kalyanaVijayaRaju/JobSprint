import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as learningPathController from '../controllers/learningPathController.js';

const router = Router();
router.use(protect);

router.get('/', learningPathController.getLearningPaths);
router.post('/', learningPathController.createLearningPath);
router.patch('/:id/modules/:moduleId/toggle', learningPathController.toggleModuleStatus);

export default router;
