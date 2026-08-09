import { FastifyInstance } from 'fastify';
import { NotificationController } from './notification.controller';
import { z } from 'zod';

const sendNotificationBodySchema = z.object({
  santriId: z.string().uuid('Format ID santri tidak valid'),
  type: z.enum(['HAFALAN_NEW', 'MURAJAAH_SCHEDULE']),
  customMessage: z.string().optional(),
});

const sendBulkNotificationBodySchema = z.object({
  santriIds: z.array(z.string().uuid('Format ID santri tidak valid')).min(1, 'Minimal 1 santri dipilih'),
  type: z.enum(['HAFALAN_NEW', 'MURAJAAH_SCHEDULE']),
  customMessage: z.string().optional(),
});

export async function notificationRoutes(fastify: FastifyInstance) {
  // All notification routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/send', NotificationController.send);
  fastify.post('/send-bulk', NotificationController.sendBulk);
  fastify.get('/', NotificationController.getHistory);
}
