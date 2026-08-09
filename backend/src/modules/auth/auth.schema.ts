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

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
