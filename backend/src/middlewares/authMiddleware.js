import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, 'Authentication token is required');
  }

  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT secret is not configured');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role
  };

  next();
});

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  return next();
};
