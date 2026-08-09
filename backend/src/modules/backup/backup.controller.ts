import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from './backup.service';

const backupService = new BackupService();

export class BackupController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const result = await backupService.createBackup(userId);

    return reply.status(201).send({
      success: true,
      message: 'Backup data berhasil dibuat & diamankan dengan enkripsi AES-256-GCM',
      data: result,
    });
  }

  static async restore(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;
    const { encryptedData, checksum } = req.body as { encryptedData: string; checksum: string };

    const result = await backupService.restoreBackup(userId, encryptedData, checksum);

    return reply.send(result);
  }

  static async getHistory(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user!.userId;

    const logs = await backupService.getBackupHistory(userId);

    return reply.send({
      success: true,
      data: logs,
    });
  }
}
