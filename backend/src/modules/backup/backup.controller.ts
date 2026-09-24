import { FastifyRequest, FastifyReply } from 'fastify';
import { BackupService } from './backup.service';

const backupService = new BackupService();

export class BackupController {
  static async create(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;

    const result = await backupService.createBackup({
      userId: user.userId,
      role: user.role,
      orgId: user.orgId,
    });

    return reply.status(201).send({
      success: true,
      message: 'Backup data berhasil dibuat & diamankan dengan enkripsi AES-256-GCM',
      data: result,
    });
  }

  static async restore(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;
    const { encryptedData, checksum } = req.body as { encryptedData: string; checksum?: string };

    if (!encryptedData) {
      return reply.status(400).send({
        success: false,
        message: 'File backup terenkripsi wajib diisi',
      });
    }

    const result = await backupService.restoreBackup(
      {
        userId: user.userId,
        role: user.role,
        orgId: user.orgId,
      },
      encryptedData,
      checksum
    );

    return reply.send(result);
  }

  static async getHistory(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user!;

    const logs = await backupService.getBackupHistory(user.userId, user.role);

    return reply.send({
      success: true,
      data: logs,
    });
  }
}

