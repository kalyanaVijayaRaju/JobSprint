import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import * as userPreferenceController from '../controllers/userPreferenceController.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/settings/preferences
router.get('/preferences', userPreferenceController.getPreferences);

// PATCH /api/v1/settings/preferences
router.patch('/preferences', userPreferenceController.updatePreferences);

export default router;
