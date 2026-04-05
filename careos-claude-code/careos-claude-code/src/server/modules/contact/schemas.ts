/**
 * Contact Module — Zod Validation Schemas
 */
import { z } from 'zod';

/**
 * E.164-ish phone validation: +, digits, spaces, dashes, parens allowed.
 * Min 7 digits (local) to max 20 chars (international with formatting).
 */
const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;

export const scheduleCallSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name too long').trim(),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format').max(20).optional(),
    email: z
      .string()
      .email('Invalid email address')
      .max(254, 'Email too long')
      .toLowerCase()
      .trim()
      .optional(),
    preferredTime: z.string().max(200, 'Preferred time too long').trim().optional(),
    reason: z.string().max(1000, 'Reason too long').trim().optional(),
    miniCiiScore: z.number().int().min(0).max(30).optional(),
    miniCiiZone: z.enum(['green', 'yellow', 'red']).optional(),
  })
  .refine((data) => data.phone || data.email, { message: 'Either phone or email is required' });

export type ScheduleCallInput = z.infer<typeof scheduleCallSchema>;
