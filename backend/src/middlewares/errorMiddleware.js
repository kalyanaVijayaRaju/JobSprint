import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = undefined;

  // Handle specific MongoDB/Mongoose errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Input validation failed';
    details = Object.values(err.errors).map((el) => el.message);
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate value entered. Record already exists.';
    details = Object.keys(err.keyValue).map(key => `${key} must be unique`);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid data format for path: ${err.path}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  const response = {
    success: false,
    error: {
      code: err.status || 'error',
      message,
      ...(details && { details }),
      ...(err.details && !details && { details: err.details })
    }
  };

  // Environment-specific response formatting and logging
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    logger.error(`[DEV] Error: ${message}`, { stack: err.stack, path: req.path });
  } else {
    if (statusCode === 500) {
      logger.error(`[PROD] Critical Error: ${err.message}`, { stack: err.stack, path: req.path });
    } else {
      logger.warn(`[PROD] API Warning: ${message}`, { path: req.path });
    }
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
