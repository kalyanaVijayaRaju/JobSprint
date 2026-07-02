import { z } from 'zod';

/**
 * Validates and coerces query parameters for listing notifications.
 * Supports page, limit, isRead filtering, and sorting.
 */
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  isRead: z.preprocess(
    (val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    },
    z.boolean().optional()
  ),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
