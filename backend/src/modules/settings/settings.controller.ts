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

  static async getTelegramStatus(req: FastifyRequest, reply: FastifyReply) {
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat melihat status Telegram.', 403);
    }

    const status = await settingsService.getTelegramStatus();
    return reply.send({
      success: true,
      data: status,
    });
  }

  static async testConnection(req: FastifyRequest, reply: FastifyReply) {
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat menguji bot Telegram.', 403);
    }

    const { token } = (req.body as any) || {};
    const result = await settingsService.testConnection(token);

    return reply.send({
      success: result.success,
      data: result.botInfo || null,
      message: result.success 
        ? `Bot @${result.botInfo?.username || 'Bot'} berhasil terhubung!` 
        : (result.error || 'Gagal terhubung ke Telegram'),
      error: result.error,
    });
  }

  static async sendTestMessage(req: FastifyRequest, reply: FastifyReply) {
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat mengirim pesan tes.', 403);
    }

    const { chatId } = (req.body as any) || {};
    const result = await settingsService.sendTestMessage(chatId);

    return reply.send({
      success: result.success,
      message: result.success ? result.message : (result.error || 'Gagal mengirim pesan tes'),
      error: result.error,
    });
  }

  static async testBackup(req: FastifyRequest, reply: FastifyReply) {
    if (req.user!.role !== 'SUPERADMIN') {
      throw new AppError('Akses ditolak. Hanya Superadmin yang dapat menjalankan uji backup.', 403);
    }

    const userId = req.user!.userId;
    const result = await settingsService.testBackupToTelegram(userId);

    return reply.send({
      success: result.success,
      message: result.message,
      data: result,
    });
  }
}
