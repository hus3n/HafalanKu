import { FastifyInstance } from 'fastify';
import { MurajaahController } from './murajaah.controller';

export async function murajaahRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', MurajaahController.getSchedules);
  fastify.post('/', MurajaahController.createSchedule);
  fastify.get('/history', MurajaahController.getHistory);
  fastify.put('/:id/toggle', MurajaahController.toggle);
  fastify.post('/send/:santriId', MurajaahController.sendWhatsApp);
}
