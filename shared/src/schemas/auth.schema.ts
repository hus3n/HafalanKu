import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  accountType: z.enum(['personal', 'organization'], {
    required_error: 'Tipe akun wajib dipilih',
  }),
  phone: z.string().min(10, 'Nomor WhatsApp / HP tidak valid (minimal 10 digit)'),
  organizationName: z.string().optional(),
  trialPeriod: z.string().optional(),
}).refine((data) => {
  if (data.accountType === 'organization' && (!data.organizationName || data.organizationName.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Nama instansi wajib diisi untuk akun organisasi',
  path: ['organizationName'],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Konfirmasi password baru minimal 8 karakter'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
