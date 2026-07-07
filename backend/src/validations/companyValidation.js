import { z } from 'zod';

// --- Schemas ---

/**
 * Validates the request body when creating a new company.
 * All required fields mirror the Company model constraints.
 */
export const createCompanySchema = z.object({
  name: z
    .string({ required_error: 'Company name is required' })
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name cannot exceed 100 characters')
    .trim(),
  logo: z
    .string()
    .url('Logo must be a valid URL')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Website must be a valid URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string({ required_error: 'Company description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  industry: z
    .string({ required_error: 'Industry is required' })
    .min(2, 'Industry must be at least 2 characters')
    .trim(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
    required_error: 'Company size is required',
    invalid_type_error: 'Invalid company size option'
  }),
  foundedYear: z
    .number()
    .int('Founded year must be an integer')
    .min(1800, 'Founded year cannot be before 1800')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
  locations: z
    .array(z.string().min(1, 'Location cannot be empty').trim())
    .min(1, 'At least one location is required')
});

/**
 * Validates the request body when updating an existing company.
 * All fields are optional but at least one must be provided.
 */
export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name cannot exceed 100 characters')
    .trim()
    .optional(),
  logo: z
    .string()
    .url('Logo must be a valid URL')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Website must be a valid URL')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),
  industry: z
    .string()
    .min(2, 'Industry must be at least 2 characters')
    .trim()
    .optional(),
  size: z
    .enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .optional(),
  foundedYear: z
    .number()
    .int('Founded year must be an integer')
    .min(1800, 'Founded year cannot be before 1800')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
  locations: z
    .array(z.string().min(1).trim())
    .min(1, 'At least one location is required')
    .optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

/**
 * Validates and coerces pagination query params for company listings.
 * Falls back to sensible defaults so callers can omit everything.
 */
export const companyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  sortBy: z.enum(['createdAt', 'name', 'foundedYear']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
