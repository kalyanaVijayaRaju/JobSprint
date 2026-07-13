import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate, registerSchema, loginSchema, changePasswordSchema } from '../validations/authValidation.js';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  getSecurityActivityLog
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/security/activity', protect, getSecurityActivityLog);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);

export default router;
