import { FastifyInstance } from 'fastify';
import { WhatsAppController } from './whatsapp.controller';
import { z } from 'zod';

const sendMessageBodySchema = z.object({
  recipientPhone: z.string().min(10, 'Nomor HP tidak valid'),
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
});

export async function whatsappRoutes(fastify: FastifyInstance) {
  // All whatsapp routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/init', WhatsAppController.initSession);
  fastify.get('/status', WhatsAppController.getStatus);
  fastify.get('/qr', WhatsAppController.getLatestQR);
  fastify.post('/disconnect', WhatsAppController.disconnect);
  fastify.post('/send', WhatsAppController.sendMessage);
}
