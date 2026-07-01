import { z } from 'zod';

// --- Schemas ---

/**
 * Validates and coerces pagination query params for the candidate's
 * saved jobs listing.  Falls back to sensible defaults.
 */
export const savedJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
