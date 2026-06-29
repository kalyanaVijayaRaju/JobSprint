import { z } from 'zod';

// --- Reusable fragments ---

const salaryRangeSchema = z.object({
  min: z.number().nonnegative('Minimum salary cannot be negative'),
  max: z.number().nonnegative('Maximum salary cannot be negative'),
  currency: z.string().length(3, 'Currency must be a 3-character ISO code').default('USD')
}).refine((data) => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['max']
});

// --- Schemas ---

export const createJobSchema = z.object({
  title: z
    .string({ required_error: 'Job title is required' })
    .min(3, 'Job title must be at least 3 characters')
    .max(150, 'Job title cannot exceed 150 characters')
    .trim(),
  description: z
    .string({ required_error: 'Job description is required' })
    .min(10, 'Job description must be at least 10 characters')
    .max(10000, 'Job description cannot exceed 10000 characters')
    .trim(),
  requirements: z
    .array(z.string().min(2, 'Each requirement must be at least 2 characters'))
    .default([]),
  skillsRequired: z
    .array(z.string().min(1))
    .min(1, 'At least one skill is required'),
  locationType: z.enum(['remote', 'onsite', 'hybrid'], {
    required_error: 'Location type is required',
    invalid_type_error: 'Location type must be remote, onsite, or hybrid'
  }),
  location: z
    .string({ required_error: 'Location is required' })
    .min(2, 'Location must be at least 2 characters')
    .trim(),
  salaryRange: salaryRangeSchema.optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship'], {
    required_error: 'Job type is required',
    invalid_type_error: 'Job type must be full-time, part-time, contract, or internship'
  }),
  expiresAt: z
    .string({ required_error: 'Expiration date is required' })
    .datetime('Expiration date must be a valid ISO 8601 date')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Expiration date must be in the future'
    })
});

export const updateJobSchema = z.object({
  title: z
    .string()
    .min(3, 'Job title must be at least 3 characters')
    .max(150, 'Job title cannot exceed 150 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Job description must be at least 10 characters')
    .max(10000, 'Job description cannot exceed 10000 characters')
    .trim()
    .optional(),
  requirements: z
    .array(z.string().min(2))
    .optional(),
  skillsRequired: z
    .array(z.string().min(1))
    .min(1, 'At least one skill is required')
    .optional(),
  locationType: z
    .enum(['remote', 'onsite', 'hybrid'])
    .optional(),
  location: z
    .string()
    .min(2)
    .trim()
    .optional(),
  salaryRange: salaryRangeSchema.optional(),
  jobType: z
    .enum(['full-time', 'part-time', 'contract', 'internship'])
    .optional(),
  status: z
    .enum(['active', 'closed', 'archived'])
    .optional(),
  expiresAt: z
    .string()
    .datetime('Expiration date must be a valid ISO 8601 date')
    .optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

/**
 * Validates and coerces pagination/filter query params for the job listing
 * endpoint.  Falls back to sensible defaults so callers can omit everything.
 */
export const jobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  locationType: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  status: z.enum(['active', 'closed', 'archived']).default('active'),
  sortBy: z.enum(['createdAt', 'title', 'salaryRange.max']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
