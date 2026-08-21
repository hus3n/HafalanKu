import { FastifyInstance } from 'fastify';
import { SantriController } from './santri.controller';

export async function santriRoutes(fastify: FastifyInstance) {
  // Semua route santri butuh otentikasi
  fastify.addHook('onRequest', fastify.authenticate);

  // Bulk Import & Export Routes (Daftarkan sebelum /:id)
  fastify.get('/template-import', SantriController.downloadTemplate);
  fastify.post('/preview-import', SantriController.previewImport);
  fastify.post('/execute-import', SantriController.executeImport);
  fastify.get('/export-full', SantriController.exportFull);

  // Standard CRUD Routes
  fastify.post('/', SantriController.create);
  fastify.get('/', SantriController.getList);
  fastify.get('/:id', SantriController.getById);
  fastify.put('/:id', SantriController.update);
  fastify.delete('/:id', SantriController.delete);
}
