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

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[^a-zA-Z0-9]/, 'New password must contain at least one special character')
}).refine(
  ({ currentPassword, newPassword }) => currentPassword !== newPassword,
  { message: 'New password must be different from the current password', path: ['newPassword'] }
);

export const securityActivityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20)
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase()
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
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
