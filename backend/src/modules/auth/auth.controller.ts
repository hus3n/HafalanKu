import { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../utils/response';
import { changePasswordSchema, loginSchema, refreshTokenSchema, registerSchema } from './auth.schema';
import { authService } from './auth.service';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = registerSchema.parse(request.body);
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const result = await authService.register(validatedData, ipAddress, userAgent);
    return reply.status(201).send(successResponse('Registrasi berhasil', result));
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
