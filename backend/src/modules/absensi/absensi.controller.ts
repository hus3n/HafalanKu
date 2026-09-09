import { FastifyRequest, FastifyReply } from 'fastify';
import { AbsensiService } from './absensi.service';
import { AppError } from '../../utils/AppError';

const absensiService = new AbsensiService();

export class AbsensiController {
  static async getAbsensi(req: FastifyRequest, reply: FastifyReply) {
    const { date, kelasId } = req.query as { date?: string; kelasId?: string };
    
    // Parse date or use today
    const filterDate = date ? new Date(date) : new Date();
    
    const result = await absensiService.getAbsensiByDateAndKelas(filterDate, kelasId);

    return reply.send({
      success: true,
      message: 'Data absensi berhasil diambil',
      data: result,
    });
  }

  static async upsertBulkAbsensi(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { date, records } = req.body as { 
      date: string, 
      records: Array<{ santriId: string, status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA', notes?: string }> 
    };

    if (!date || !records || !Array.isArray(records)) {
      throw new AppError('Data date dan records tidak valid', 400);
    }

    const filterDate = new Date(date);
    
    const result = await absensiService.upsertBulkAbsensi(userId, filterDate, records);

    return reply.send({
      success: true,
      message: 'Absensi berhasil disimpan',
      data: result,
    });
  }
}
