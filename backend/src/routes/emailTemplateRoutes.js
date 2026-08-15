import { Router } from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import * as emailTemplateController from '../controllers/emailTemplateController.js';

const router = Router();

// All email template routes require authentication and recruiter role
router.use(protect, authorizeRoles('recruiter'));

router.get('/', emailTemplateController.listTemplates);
router.post('/', emailTemplateController.createTemplate);
router.get('/:id', emailTemplateController.getTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);
router.post('/:id/render', emailTemplateController.renderTemplate);

export default router;
