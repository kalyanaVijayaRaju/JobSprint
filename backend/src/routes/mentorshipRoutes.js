import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as mentorshipController from '../controllers/mentorshipController.js';

const router = Router();

router.get('/mentors', mentorshipController.getMentors);

router.use(protect);
router.post('/book', mentorshipController.bookSession);
router.get('/my-sessions', mentorshipController.getMySessions);
router.post('/seed', authorizeRoles('admin'), mentorshipController.seedMentors);

export default router;
