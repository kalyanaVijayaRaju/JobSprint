import { z } from 'zod';

// --- Schemas ---

/**
 * Validates the request body when a candidate applies for a job.
 * Cover letter is optional; the service layer handles resume snapshot.
 */
export const applySchema = z.object({
  coverLetter: z
    .string()
    .max(5000, 'Cover letter cannot exceed 5000 characters')
    .trim()
    .optional()
});

/**
 * Validates the request body when a recruiter transitions an application
 * to a new pipeline stage.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['screening', 'interviewing', 'offered', 'rejected'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of: screening, interviewing, offered, rejected'
  })
});

/**
 * Validates the request body when a recruiter adds an internal note
 * to an application.
 */
export const addNoteSchema = z.object({
  note: z
    .string({ required_error: 'Note text is required' })
    .min(1, 'Note cannot be empty')
    .max(1000, 'Note cannot exceed 1000 characters')
    .trim()
});

/**
 * Validates and coerces pagination/filter query params for the candidate's
 * "my applications" listing.  Falls back to sensible defaults.
 */
export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z
    .enum(['applied', 'screening', 'interviewing', 'offered', 'rejected'])
    .optional(),
  sortBy: z.enum(['createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Validates and coerces pagination/filter query params for the recruiter's
 * "applicants for a job" listing.
 */
export const jobApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z
    .enum(['applied', 'screening', 'interviewing', 'offered', 'rejected'])
    .optional(),
  sortBy: z.enum(['createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
