import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { validate, registerSchema, loginSchema } from '../validations/authValidation.js';
import { register, login, logout, getMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
