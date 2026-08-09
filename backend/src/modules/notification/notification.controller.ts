import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  static async send(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId, type, customMessage } = req.body as {
      santriId: string;
      type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE';
      customMessage?: string;
    };

    const result = await notificationService.sendNotification(userId, santriId, type, customMessage);

    return reply.send({
      success: result.success,
      message: result.success ? 'Notifikasi berhasil dikirim' : 'Gagal mengirim notifikasi',
      data: result,
    });
  }

  static async sendBulk(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriIds, type, customMessage } = req.body as {
      santriIds: string[];
      type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE';
      customMessage?: string;
    };

    const result = await notificationService.sendBulkNotifications(userId, santriIds, type, customMessage);

    return reply.send({
      success: true,
      message: 'Proses pengiriman notifikasi masal selesai',
      data: result,
    });
  }

  static async getHistory(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { page = 1, limit = 10, status, type } = req.query as any;

    const result = await notificationService.getNotificationHistory(
      userId,
      Number(page),
      Number(limit),
      status,
      type
    );

    return reply.send({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }
}
