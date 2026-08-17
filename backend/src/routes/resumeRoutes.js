import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as resumeController from '../controllers/resumeController.js';

const router = Router();

router.use(protect, authorizeRoles('candidate'));

router.get('/', resumeController.listResumes);
router.post('/', resumeController.createResume);
router.get('/:id', resumeController.getResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.get('/:id/preview', resumeController.previewResume);
router.get('/:id/pdf', resumeController.downloadResumePDF);

export default router;
