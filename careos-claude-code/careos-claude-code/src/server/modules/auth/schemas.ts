/**
 * Auth Module — Zod Validation Schemas
 */
import { z } from 'zod';
import { emailSchema, passwordSchema, userRoleSchema } from '../../common/validators.js';

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: userRoleSchema,
  phone: z.string().max(20).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const setup2FASchema = z.object({
  // No input needed — generates secret for current user
});

export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;
