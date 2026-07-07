import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, loginUser, generateToken, changeUserPassword } from '../services/authService.js';
import env from '../config/env.js';

/**
 * Cookie options for the JWT token.
 * httpOnly prevents XSS-based token theft.
 * secure flag is set in production for HTTPS-only transmission.
 * sameSite: 'strict' mitigates CSRF attacks.
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
});

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const userData = await registerUser(req.body);
  const token = generateToken(userData);

  res
    .status(201)
    .cookie('token', token, getCookieOptions())
    .json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: userData
      }
    });
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const userData = await loginUser(req.body);
  const token = generateToken(userData);

  res
    .status(200)
    .cookie('token', token, getCookieOptions())
    .json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData
      }
    });
});

/**
 * @route   POST /api/v1/auth/logout
 * @access  Authenticated
 */
export const logout = asyncHandler(async (_req, res) => {
  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    })
    .json({
      success: true,
      message: 'Logout successful'
    });
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Authenticated
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await changeUserPassword(req.user.id, req.body.currentPassword, req.body.newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});
