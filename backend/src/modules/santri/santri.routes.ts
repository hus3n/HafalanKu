import { FastifyInstance } from 'fastify';
import { SantriController } from './santri.controller';
import { createSantriSchema, updateSantriSchema } from 'shared';
import { z } from 'zod';

const getSantriQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  search: z.string().optional(),
  kelasId: z.string().optional(),
});

export async function santriRoutes(fastify: FastifyInstance) {
  // Semua route santri butuh otentikasi
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/', SantriController.create);
  fastify.get('/', SantriController.getList);
  fastify.get('/:id', SantriController.getById);
  fastify.put('/:id', SantriController.update);
  fastify.delete('/:id', SantriController.delete);
}
