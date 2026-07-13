import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

const getAuthToken = (req) => {
  return getBearerToken(req.headers.authorization) || req.cookies?.token || null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getAuthToken(req);

  if (!token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT secret is not configured');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.sub).select('email role isActive passwordChangedAt');

  if (!user) {
    throw new ApiError(401, 'Authentication user no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  if (user.passwordChangedAt && decoded.iat) {
    const passwordChangedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);

    if (decoded.iat < passwordChangedAtSeconds) {
      throw new ApiError(401, 'Authentication token is no longer valid. Please log in again.');
    }
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  next();
});

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  return next();
};
