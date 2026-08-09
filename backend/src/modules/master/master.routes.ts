import { FastifyInstance } from 'fastify';
import { masterController } from './master.controller';

export async function masterRoutes(fastify: FastifyInstance) {
  // Public routes (No auth required)
  fastify.get('/surah', masterController.getSurahs);
  fastify.get('/predikat', masterController.getPredikats);
}
