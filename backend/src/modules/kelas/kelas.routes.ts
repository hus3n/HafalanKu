import { FastifyInstance } from 'fastify';
import { KelasController } from './kelas.controller';
import { createKelasSchema } from 'shared';
import { z } from 'zod';

const assignSantriBodySchema = z.object({
  santriId: z.string().uuid('Format ID santri tidak valid'),
});

export async function kelasRoutes(fastify: FastifyInstance) {
  // All kelas routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/', KelasController.create);
  fastify.get('/', KelasController.getList);
  fastify.get('/:id', KelasController.getById);
  fastify.put('/:id', KelasController.update);
  fastify.delete('/:id', KelasController.delete);

  // Assign / Unassign Santri
  fastify.post('/:id/santri', KelasController.assignSantri);
  fastify.delete('/:id/santri/:santriId', KelasController.unassignSantri);
}
