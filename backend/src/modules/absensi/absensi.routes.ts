import { FastifyInstance } from 'fastify';
import { AbsensiController } from './absensi.controller';

export async function absensiRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Get absensi per day per class
  fastify.get('/', AbsensiController.getAbsensi);

  // Endpoint for bulk update absensi (Ustadz marks an entire class)
  fastify.register(async (authorizedRoutes) => {
    authorizedRoutes.addHook('onRequest', fastify.authorize(['ADMIN', 'SUPERADMIN', 'USER']));
    authorizedRoutes.post('/bulk', AbsensiController.upsertBulkAbsensi);
  });
}
