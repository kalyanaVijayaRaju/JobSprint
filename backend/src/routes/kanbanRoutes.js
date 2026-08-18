import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import * as kanbanController from '../controllers/kanbanController.js';

const router = Router();
router.use(protect);

router.get('/board', kanbanController.getBoard);
router.patch('/:applicationId/move', kanbanController.moveCard);

export default router;
