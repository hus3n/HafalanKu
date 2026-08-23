import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../utils/response';
import { 
  changePasswordSchema, 
  googleAuthSchema, 
  loginSchema, 
  refreshTokenSchema, 
  registerSchema, 
  resendOtpSchema, 
  verifyEmailSchema 
} from './auth.schema';
import { authService } from './auth.service';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = registerSchema.parse(request.body);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.register(validatedData, ipAddress, userAgent);
    return reply.status(201).send(successResponse(result.message, result));
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const { email, otp } = verifyEmailSchema.parse(request.body);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.verifyEmail(email, otp, ipAddress, userAgent);
    return reply.send(successResponse(result.message, result));
  }

  async resendOtp(request: FastifyRequest, reply: FastifyReply) {
    const { email } = resendOtpSchema.parse(request.body);
    const result = await authService.resendOtp(email);
    return reply.send(successResponse(result.message, result));
  }

  async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = googleAuthSchema.parse(request.body);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.googleAuth(validatedData, ipAddress, userAgent);
    return reply.send(successResponse('Login Google berhasil', result));
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = loginSchema.parse(request.body);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.login(validatedData, ipAddress, userAgent);
    return reply.send(successResponse('Login berhasil', result));
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = refreshTokenSchema.parse(request.body);
    const result = await authService.refreshToken(validatedData.refreshToken);
    return reply.send(successResponse('Token berhasil diperbarui', result));
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = changePasswordSchema.parse(request.body);
    const userId = request.user!.userId;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.changePassword(userId, validatedData, ipAddress, userAgent);
    return reply.send(successResponse(result.message));
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const user = await authService.getMe(userId);
    return reply.send(successResponse('Data profil pengguna', user));
  }
}

export const authController = new AuthController();
