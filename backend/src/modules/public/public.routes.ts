import { FastifyInstance } from 'fastify';
import { publicController } from './public.controller';

export async function publicRoutes(fastify: FastifyInstance) {
  // Public routes do NOT require authentication
  fastify.get('/stats', publicController.getLandingStats);
}
