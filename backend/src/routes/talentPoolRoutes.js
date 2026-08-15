import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as talentPoolController from '../controllers/talentPoolController.js';

const router = Router();

// Recruiter-only talent pool search
router.get('/search', protect, authorizeRoles('recruiter'), talentPoolController.searchCandidates);

export default router;
