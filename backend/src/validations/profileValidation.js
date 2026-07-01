import { z } from 'zod';

// --- Reusable sub-schemas ---

const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required').trim(),
  position: z.string().min(1, 'Position is required').trim(),
  location: z.string().trim().optional(),
  startDate: z.string().datetime('Start date must be a valid ISO 8601 date'),
  endDate: z.string().datetime('End date must be a valid ISO 8601 date').optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').trim().optional()
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required').trim(),
  degree: z.string().min(1, 'Degree is required').trim(),
  fieldOfStudy: z.string().min(1, 'Field of study is required').trim(),
  startDate: z.string().datetime('Start date must be a valid ISO 8601 date'),
  endDate: z.string().datetime('End date must be a valid ISO 8601 date').optional(),
  current: z.boolean().default(false)
});

const portfolioLinksSchema = z.object({
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

// --- Candidate Profile Schema ---

export const candidateProfileSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number')
    .optional()
    .or(z.literal('')),
  summary: z
    .string()
    .max(2000, 'Summary cannot exceed 2000 characters')
    .trim()
    .optional(),
  skills: z
    .array(z.string().trim().min(1))
    .default([]),
  experience: z
    .array(experienceSchema)
    .default([]),
  education: z
    .array(educationSchema)
    .default([]),
  portfolioLinks: portfolioLinksSchema.optional()
});

// --- Recruiter Profile Schema ---

export const recruiterProfileSchema = z.object({
  companyId: z
    .string({ required_error: 'Company ID is required' })
    .min(1, 'Company ID is required'),
  jobTitle: z
    .string({ required_error: 'Job title is required' })
    .min(1, 'Job title is required')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid E.164 phone number')
    .optional()
    .or(z.literal(''))
});
