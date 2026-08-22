import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as talentRadarController from '../controllers/talentRadarController.js';

const router = Router();
router.use(protect, authorizeRoles('recruiter', 'admin'));

router.post('/search', talentRadarController.searchTalentRadar);

export default router;
