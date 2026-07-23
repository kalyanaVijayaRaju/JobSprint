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

const futureDateTime = z.string()
  .datetime('Interview time must be a valid ISO 8601 date')
  .refine((value) => new Date(value) > new Date(), 'Interview time must be in the future');

const interviewFields = {
  scheduledAt: futureDateTime,
  durationMinutes: z.coerce.number().int().min(15).max(480),
  meetingType: z.enum(['video', 'phone', 'onsite']),
  location: z.string().trim().max(300).optional(),
  meetingUrl: z.string().url('Meeting URL must be a valid URL').max(2000).optional(),
  timezone: z.string().trim().min(1, 'Timezone is required').max(80),
  instructions: z.string().trim().max(2000).optional()
};

/** Validates a recruiter-created interview schedule. */
export const scheduleInterviewSchema = z.object(interviewFields);

/** Validates an interview reschedule or terminal lifecycle update. */
export const updateInterviewSchema = z.object({
  scheduledAt: futureDateTime.optional(),
  durationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  meetingType: z.enum(['video', 'phone', 'onsite']).optional(),
  location: z.string().trim().max(300).optional(),
  meetingUrl: z.string().url('Meeting URL must be a valid URL').max(2000).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  instructions: z.string().trim().max(2000).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one interview field must be provided'
});

/** Validates the candidate's response to a scheduled interview. */
export const respondToInterviewSchema = z.object({
  response: z.enum(['accepted', 'declined'], {
    required_error: 'Interview response is required'
  }),
  note: z.string().trim().max(500, 'Response note cannot exceed 500 characters').optional()
});

/** Shared pagination and filtering contract for upcoming interview calendars. */
export const interviewCalendarQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  from: z.string().datetime('from must be a valid ISO 8601 date').optional(),
  to: z.string().datetime('to must be a valid ISO 8601 date').optional(),
  meetingType: z.enum(['video', 'phone', 'onsite']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled')
}).refine((data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to), {
  message: 'from must be before to',
  path: ['from']
});

/**
 * Validates and coerces pagination/filter query params for the candidate's
 * "my applications" listing.  Falls back to sensible defaults.
 */
export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z
    .enum(['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'])
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
    .enum(['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'])
    .optional(),
  sortBy: z.enum(['createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
