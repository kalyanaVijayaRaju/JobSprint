import { z } from 'zod';

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  search: z.string().trim().min(1).max(100).optional()
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'Account status is required' }),
  reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional()
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).max(100).optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
}).refine(
  ({ from, to }) => !from || !to || from <= to,
  { message: 'from date must be before to date', path: ['from'] }
);
