import { z } from 'zod';
import { adminRoleValues } from '../auth/roles';

export const adminLoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(256),
});

export const adminPasswordResetRequestSchema = z
  .object({
    email: z.string().trim().email().max(254),
    turnstileToken: z.string().trim().min(1).max(2_048).optional(),
  })
  .strict();

export const adminPasswordResetSchema = z
  .object({
    token: z.string().trim().min(32).max(256),
    password: z.string().min(12).max(256),
  })
  .strict();

export const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(256),
  role: z.enum(adminRoleValues),
});

export const updateAdminSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
    role: z.enum(adminRoleValues).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminPasswordResetRequestInput = z.infer<typeof adminPasswordResetRequestSchema>;
export type AdminPasswordResetInput = z.infer<typeof adminPasswordResetSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
