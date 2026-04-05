/**
 * Server-side validation helpers using Zod
 */
import { z } from 'zod';
import { USER_ROLES, TASK_TYPES, PAYMENT_SOURCES } from '@shared/constants/business-rules';

// Re-usable Zod schemas for common patterns
export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(8).max(128);
export const uuidSchema = z.string().min(1).max(255);

export const userRoleSchema = z.enum(USER_ROLES);
export const taskTypeSchema = z.enum(TASK_TYPES);
export const paymentSourceSchema = z.enum(PAYMENT_SOURCES);

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ciiScoresSchema = z.array(z.number().int().min(1).max(10)).length(12);

export const miniCiiScoresSchema = z.array(z.number().int().min(1).max(10)).length(3);

export const kbsRatingSchema = z.number().int().min(1).max(5);

export const membershipStatusSchema = z.enum([
  'pending',
  'active',
  'grace_period',
  'suspended',
  'cancelled',
]);
