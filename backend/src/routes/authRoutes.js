import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validations/authValidation.js';
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  getSecurityActivityLog,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/security/activity', protect, getSecurityActivityLog);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);

// Password recovery and verification
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;

