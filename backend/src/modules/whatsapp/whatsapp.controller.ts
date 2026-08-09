import { FastifyRequest, FastifyReply } from 'fastify';
import { WhatsAppService } from './whatsapp.service';

const whatsappService = new WhatsAppService();

export class WhatsAppController {
  static async initSession(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const result = await whatsappService.initSession(userId);

    return reply.send({
      success: true,
      message: 'QR Code pairing berhasil dibuat',
      data: result,
    });
  }

  static async getStatus(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const status = await whatsappService.getStatus(userId);

    return reply.send({
      success: true,
      data: status,
    });
  }

  static async getLatestQR(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const qrCode = await whatsappService.getLatestQR(userId);

    return reply.send({
      success: true,
      data: { qrCode },
    });
  }

  static async disconnect(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const result = await whatsappService.disconnect(userId);

    return reply.send(result);
  }

  static async sendMessage(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { recipientPhone, message } = req.body as { recipientPhone: string; message: string };

    const result = await whatsappService.sendMessage(userId, recipientPhone, message);

    if (!result.success) {
      return reply.status(400).send({
        success: false,
        message: (result as any).error || 'Gagal mengirim pesan WhatsApp. Silakan hubungkan ulang QR WhatsApp.',
        data: result,
      });
    }

    return reply.send({
      success: true,
      message: 'Pesan WhatsApp berhasil dikirim',
      data: result,
    });
  }
}
