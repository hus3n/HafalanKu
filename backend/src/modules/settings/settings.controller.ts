import { FastifyRequest, FastifyReply } from 'fastify';
import { SettingsService } from './settings.service';
import { AppError } from '../../utils/AppError';

const settingsService = new SettingsService();

export class SettingsController {
  static async getEnv(req: FastifyRequest, reply: FastifyReply) {
    // Only SUPERADMIN can view and edit env settings
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat mengakses pengaturan ini.', 403);
    }

    const data = await settingsService.getEnvSettings();
    return reply.send({ success: true, data });
  }

  static async updateEnv(req: FastifyRequest, reply: FastifyReply) {
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat mengakses pengaturan ini.', 403);
    }

    const body = req.body as any;
    const data = await settingsService.updateEnvSettings(body);

    return reply.send({ 
      success: true, 
      message: 'Pengaturan environment berhasil disimpan', 
      data 
    });
  }
}
