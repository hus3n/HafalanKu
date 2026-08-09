import { FastifyInstance } from 'fastify';
import { HafalanController } from './hafalan.controller';
import { createHafalanSchema, updateHafalanSchema } from 'shared';
import { z } from 'zod';

const getHafalanQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  santriId: z.string().optional(),
  surahNumber: z.string().optional().transform(Number),
  predikat: z.string().optional(),
});

export async function hafalanRoutes(fastify: FastifyInstance) {
  // All hafalan routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/', HafalanController.create);
  fastify.post('/bulk', HafalanController.createBulk);
  fastify.get('/rekap-global', HafalanController.getRekapGlobal);
  fastify.get('/', HafalanController.getList);
  fastify.get('/:id', HafalanController.getById);
  fastify.put('/:id', HafalanController.update);
  fastify.delete('/:id', HafalanController.delete);
}
