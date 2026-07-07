import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import env from '../config/env.js';

/**
 * Register a new user account.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.role - 'candidate' or 'recruiter'
 * @returns {Object} The created user (without passwordHash)
 */
export const registerUser = async ({ email, password, role }) => {
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  const user = await User.create({
    email,
    passwordHash: password, // pre-save hook will hash this
    role
  });

  return {
    id: user._id,
    email: user.email,
    role: user.role
  };
};

/**
 * Authenticate a user with email and password.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Object} The authenticated user data
 */
export const loginUser = async ({ email, password }) => {
  // Explicitly select passwordHash since it has select: false on the schema
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    id: user._id,
    email: user.email,
    role: user.role
  };
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

/**
 * Generate a signed JWT for a user.
 *
 * @param {Object} user
 * @param {string} user.id
 * @param {string} user.email
 * @param {string} user.role
 * @returns {string} Signed JWT string
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};
