import { FastifyRequest, FastifyReply } from 'fastify';
import { MurajaahService } from './murajaah.service';

const murajaahService = new MurajaahService();

export class MurajaahController {
  static async getSchedules(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId, kelasId } = req.query as { santriId?: string; kelasId?: string };

    const result = await murajaahService.getSchedules(userId, santriId, kelasId);

    return reply.send({
      success: true,
      data: result,
    });
  }

  static async toggle(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = await murajaahService.toggleSchedule(userId, id);

    return reply.send({
      success: true,
      message: 'Status murajaah berhasil diperbarui',
      data: result,
    });
  }

  static async createSchedule(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId, surahNumber, surahName } = req.body as { santriId: string; surahNumber: number; surahName: string };
    
    const result = await murajaahService.createSchedule(userId, santriId, surahNumber, surahName);
    
    return reply.send({ success: true, data: result });
  }

  static async getHistory(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId, kelasId } = req.query as { santriId?: string; kelasId?: string };
    
    const result = await murajaahService.getHistory(userId, santriId, kelasId);
    
    return reply.send({ success: true, data: result });
  }

  static async updateSchedule(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { surahNumber, surahName } = req.body as { surahNumber: number; surahName: string };

    const result = await murajaahService.updateScheduleSurah(userId, id, surahNumber, surahName);
    return reply.send({ success: true, message: 'Jadwal murajaah berhasil diperbarui', data: result });
  }

  static async deleteSchedule(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };

    const result = await murajaahService.deleteSchedule(userId, id);
    return reply.send({ success: true, message: 'Jadwal murajaah berhasil dihapus', data: result });
  }

  static async sendWhatsApp(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId } = req.params as { santriId: string };

    const result = await murajaahService.sendScheduleToWhatsApp(userId, santriId);

    return reply.send({
      success: result.success,
      message: result.success ? 'Pesan WhatsApp berhasil dikirim' : (result.error || 'Gagal mengirim pesan WhatsApp'),
      data: result,
    });
  }

  static async sendBatchWhatsApp(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriIds } = req.body as { santriIds: string[] };

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'Daftar santriIds tidak boleh kosong',
      });
    }

    const result = await murajaahService.sendBatchScheduleToWhatsApp(userId, santriIds);

    return reply.send({
      success: true,
      message: `Proses pengiriman selesai. Berhasil: ${result.successful}, Gagal: ${result.failed}`,
      data: result,
    });
  }

  static async simulateReply(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { santriId } = req.params as { santriId: string };
    const { message } = (req.body || {}) as { message?: string };

    const result = await murajaahService.simulateParentReply(userId, santriId, message || 'sudah');

    return reply.send(result);
  }
}
