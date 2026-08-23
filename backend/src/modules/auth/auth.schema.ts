export {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ChangePasswordInput,
} from 'shared';
import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token wajib diisi'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  otp: z.string().length(6, 'Kode OTP harus berupa 6 digit angka'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(10, 'Google credential token wajib diisi'),
  accountType: z.enum(['personal', 'organization']).default('personal'),
  organizationName: z.string().optional(),
  phone: z.string().optional(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
