import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter.
 *
 * Caps all endpoints at 100 requests per 15-minute window per IP.
 * This protects against general abuse while remaining generous enough
 * for normal interactive use.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  }
});

/**
 * Stricter rate limiter for authentication endpoints.
 *
 * Caps login/register at 20 requests per 15-minute window per IP
 * to slow down brute-force and credential-stuffing attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.'
    }
  }
});
