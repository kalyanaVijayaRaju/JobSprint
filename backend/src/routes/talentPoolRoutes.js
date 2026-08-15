import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import * as talentPoolController from '../controllers/talentPoolController.js';

const router = Router();

// Recruiter-only talent pool search
router.get('/search', authenticate, authorize('recruiter'), talentPoolController.searchCandidates);

export default router;
