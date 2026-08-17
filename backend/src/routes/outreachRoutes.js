import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as outreachController from '../controllers/outreachController.js';

const router = Router();

router.use(protect, authorizeRoles('recruiter', 'admin'));

router.post('/send', outreachController.sendOutreachEmail);
router.post('/bulk-send', outreachController.sendBulkOutreach);

export default router;
