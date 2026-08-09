import { FastifyInstance } from 'fastify';
import { DashboardController } from './dashboard.controller';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/stats', DashboardController.getStats);
}
