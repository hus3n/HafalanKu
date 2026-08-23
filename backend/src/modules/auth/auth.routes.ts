import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', authController.register);
  fastify.post('/verify-email', authController.verifyEmail);
  fastify.post('/resend-otp', authController.resendOtp);
  fastify.post('/google', authController.googleAuth);
  fastify.post('/login', authController.login);
  fastify.post('/refresh', authController.refresh);

  // Authenticated routes
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', fastify.authenticate);

    protectedRoutes.post('/change-password', authController.changePassword);
    protectedRoutes.get('/me', authController.getMe);
  });
}
