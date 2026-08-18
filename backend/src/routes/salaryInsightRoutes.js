import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as salaryInsightController from '../controllers/salaryInsightController.js';

const router = Router();

router.get('/', salaryInsightController.getSalaryData);
router.get('/trends/:jobTitle', salaryInsightController.getSalaryTrends);

router.use(protect);
router.post('/report', salaryInsightController.submitReport);
router.post('/seed', authorizeRoles('admin'), salaryInsightController.seedSalaryData);

export default router;
