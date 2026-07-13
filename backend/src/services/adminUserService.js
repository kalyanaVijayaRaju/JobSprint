import mongoose from 'mongoose';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/apiError.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toUserSummary = (user) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt
});

export const listUsers = async ({ page, limit, role, isActive, search }) => {
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (typeof isActive === 'boolean') {
    filter.isActive = isActive;
  }

  if (search) {
    filter.email = { $regex: escapeRegex(search), $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('email role isActive isVerified lastLoginAt createdAt')
      .lean(),
    User.countDocuments(filter)
  ]);

  return {
    users: users.map(toUserSummary),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateUserStatus = async (targetUserId, actorUserId, { isActive, reason }, requestContext = {}) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (targetUserId === actorUserId) {
    throw new ApiError(400, 'Admins cannot change their own account status');
  }

  const user = await User.findById(targetUserId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = isActive;
  if (isActive) {
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
  }

  await user.save({ validateBeforeSave: false });

  await AuditLog.logEvent({
    userId: actorUserId,
    action: isActive ? 'admin.user_activated' : 'admin.user_deactivated',
    severity: 'warning',
    details: {
      targetUserId: user._id,
      targetEmail: user.email,
      reason: reason || ''
    },
    ...requestContext
  });

  return toUserSummary(user);
};

export const listAuditLogs = async ({ page, limit, userId, action, severity, from, to }) => {
  const filter = {};

  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user id');
    }
    filter.userId = userId;
  }

  if (action) {
    filter.action = action;
  }

  if (severity) {
    filter.severity = severity;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      filter.createdAt.$gte = from;
    }
    if (to) {
      filter.createdAt.$lte = to;
    }
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email role')
      .lean(),
    AuditLog.countDocuments(filter)
  ]);

  return {
    logs: logs.map((log) => ({
      id: log._id,
      user: log.userId
        ? {
            id: log.userId._id.toString(),
            email: log.userId.email,
            role: log.userId.role
          }
        : null,
      action: log.action,
      severity: log.severity,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details,
      createdAt: log.createdAt
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
