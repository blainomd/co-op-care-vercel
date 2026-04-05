/**
 * Employer Schemas — Zod validation for employer endpoints
 */
import { z } from 'zod';

export const quarterlyROIQuerySchema = z.object({
  quarters: z.coerce.number().int().min(1).max(8).optional().default(4),
});

export type QuarterlyROIQuery = z.infer<typeof quarterlyROIQuerySchema>;
