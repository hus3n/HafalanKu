import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER']).default('USER'),
  phone: z.string().min(10, 'Nomor WhatsApp / HP tidak valid (minimal 10 digit)'),
  organizationId: z.string().nullable().optional(),
  organizationName: z.string().optional(),
  isTrial: z.boolean().optional(),
  trialDays: z.number().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  organizationId: z.string().nullable().optional(),
  organizationName: z.string().optional(),
  activeUntil: z.string().nullable().optional(),
  isTrial: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phone: z.string().optional(),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url('URL avatar tidak valid').or(z.string().startsWith('data:image/')),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
