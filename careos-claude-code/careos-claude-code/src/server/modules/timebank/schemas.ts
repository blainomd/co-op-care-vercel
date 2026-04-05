/**
 * Time Bank Module — Zod Validation Schemas
 */
import { z } from 'zod';
import { taskTypeSchema, geoPointSchema } from '../../common/validators.js';

export const createTaskSchema = z.object({
  careRecipientId: z.string().min(1).optional(),
  taskType: taskTypeSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: geoPointSchema,
  estimatedHours: z.number().min(0.25).max(24),
  isRemote: z.boolean().default(false),
  scheduledFor: z.string().datetime().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const acceptTaskSchema = z.object({
  taskId: z.string().min(1),
});

export type AcceptTaskInput = z.infer<typeof acceptTaskSchema>;

export const checkInSchema = z.object({
  taskId: z.string().min(1),
  location: geoPointSchema,
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
  taskId: z.string().min(1),
  location: geoPointSchema,
  actualHours: z.number().min(0.25).max(24),
  rating: z.number().int().min(1).max(5).optional(),
  gratitudeNote: z.string().max(500).optional(),
});

export type CheckOutInput = z.infer<typeof checkOutSchema>;

export const buyCreditsSchema = z.object({
  hours: z.number().min(1).max(100),
});

export type BuyCreditsInput = z.infer<typeof buyCreditsSchema>;

export const cascadeQuerySchema = z.object({
  userId: z.string().min(1),
  depth: z.number().int().min(1).max(10).default(5),
});

export type CascadeQueryInput = z.infer<typeof cascadeQuerySchema>;
