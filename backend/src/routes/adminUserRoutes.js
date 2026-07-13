import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { validate } from '../validations/authValidation.js';
import { updateUserStatusSchema } from '../validations/adminUserValidation.js';
import {
  getUsers,
  patchUserStatus,
  getAuditLogs
} from '../controllers/adminUserController.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), patchUserStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
