import { FastifyInstance } from 'fastify';
import { ReportController } from './report.controller';
import { z } from 'zod';

const reportQuerySchema = z.object({
  month: z.string().optional().transform(Number),
  year: z.string().optional().transform(Number),
  kelasId: z.string().optional(),
  santriId: z.string().optional(),
});

export async function reportRoutes(fastify: FastifyInstance) {
  // All report routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/recap', ReportController.getRecap);
  fastify.get('/download', ReportController.downloadExcel);
}
