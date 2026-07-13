import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/apiError.js';
import env from '../config/env.js';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_MINUTES = 15;

const toSafeUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role
});

const getLockDate = () => new Date(Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000);

const isAccountLocked = (user) => user.lockUntil && user.lockUntil > new Date();

const logSecurityEvent = async ({
  userId = null,
  action,
  details = {},
  severity = 'info',
  ipAddress = '',
  userAgent = ''
}) => {
  try {
    await AuditLog.logEvent({ userId, action, details, severity, ipAddress, userAgent });
  } catch {
    // Audit logging should not block the main authentication flow.
  }
};

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

  return toSafeUser(user);
};

/**
 * Authenticate a user with email and password.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Object} The authenticated user data
 */
export const loginUser = async ({ email, password }, requestContext = {}) => {
  // Explicitly select passwordHash since it has select: false on the schema
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    await logSecurityEvent({
      action: 'auth.login_failed',
      severity: 'warning',
      details: { email, reason: 'user_not_found' },
      ...requestContext
    });
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    await logSecurityEvent({
      userId: user._id,
      action: 'auth.login_failed',
      severity: 'warning',
      details: { reason: 'inactive_account' },
      ...requestContext
    });
    throw new ApiError(403, 'This account has been deactivated');
  }

  if (isAccountLocked(user)) {
    await logSecurityEvent({
      userId: user._id,
      action: 'auth.login_failed',
      severity: 'warning',
      details: { reason: 'account_locked', lockUntil: user.lockUntil },
      ...requestContext
    });
    throw new ApiError(423, 'Account is temporarily locked. Please try again later.');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    user.failedLoginAttempts = failedLoginAttempts;

    if (failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockUntil = getLockDate();
      await logSecurityEvent({
        userId: user._id,
        action: 'auth.account_locked',
        severity: 'critical',
        details: {
          failedLoginAttempts,
          lockUntil: user.lockUntil
        },
        ...requestContext
      });
    }

    await user.save({ validateBeforeSave: false });
    await logSecurityEvent({
      userId: user._id,
      action: 'auth.login_failed',
      severity: 'warning',
      details: { reason: 'invalid_password', failedLoginAttempts },
      ...requestContext
    });
    throw new ApiError(401, 'Invalid email or password');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  await logSecurityEvent({
    userId: user._id,
    action: 'auth.login_success',
    details: {},
    ...requestContext
  });

  return toSafeUser(user);
};

export const changeUserPassword = async (userId, currentPassword, newPassword, requestContext = {}) => {
  const user = await User.findById(userId).select('+passwordHash');

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  await logSecurityEvent({
    userId: user._id,
    action: 'auth.password_changed',
    severity: 'info',
    details: {},
    ...requestContext
  });
};

export const getSecurityActivity = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('action severity ipAddress userAgent details createdAt')
      .lean(),
    AuditLog.countDocuments({ userId })
  ]);

  return {
    events: events.map((event) => ({
      id: event._id.toString(),
      action: event.action,
      severity: event.severity,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
      createdAt: event.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
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
