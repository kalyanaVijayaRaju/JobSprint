import { z } from 'zod';

export const createJobAlertSchema = z.object({
  keyword: z.string().trim().default(''),
  locationType: z.enum(['remote', 'onsite', 'hybrid', '']).default(''),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', '']).default(''),
  minSalary: z.coerce.number().nonnegative('Minimum salary threshold cannot be negative').default(0),
  isActive: z.boolean().default(true)
});

export const updateJobAlertSchema = z.object({
  keyword: z.string().trim().optional(),
  locationType: z.enum(['remote', 'onsite', 'hybrid', '']).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', '']).optional(),
  minSalary: z.coerce.number().nonnegative('Minimum salary threshold cannot be negative').optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
