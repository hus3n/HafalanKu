import { FastifyInstance } from 'fastify';
import { BackupController } from './backup.controller';
import { z } from 'zod';

const restoreBodySchema = z.object({
  encryptedData: z.string().min(1, 'File backup terenkripsi wajib diisi'),
  checksum: z.string().length(64, 'Format SHA-256 checksum harus 64 karakter hex'),
});

export async function backupRoutes(fastify: FastifyInstance) {
  // All backup routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/create', BackupController.create);
  fastify.post('/restore', BackupController.restore);
  fastify.get('/history', BackupController.getHistory);
}
