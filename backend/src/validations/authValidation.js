import { z } from 'zod';
import ApiError from '../utils/apiError.js';

// --- Schemas ---

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['candidate', 'recruiter'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either candidate or recruiter'
  })
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

// --- Middleware Factory ---

/**
 * Returns an Express middleware that validates req.body against the given
 * Zod schema.  On failure it throws an ApiError(400) with structured details
 * so the global error handler can respond consistently.
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => issue.message);
    const error = new ApiError(400, 'Validation failed', true);
    error.details = details;
    throw error;
  }

  // Replace req.body with the parsed (trimmed / lowercased) data
  req.body = result.data;
  next();
};
