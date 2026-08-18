import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as comparisonController from '../controllers/comparisonController.js';

const router = Router();
router.use(protect, authorizeRoles('recruiter', 'admin'));

router.post('/', comparisonController.compareCandidates);

export default router;
