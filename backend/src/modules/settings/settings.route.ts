import { FastifyInstance } from 'fastify';
import { SettingsController } from './settings.controller';

export async function settingsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/env', SettingsController.getEnv);
  fastify.put('/env', SettingsController.updateEnv);

  // Telegram bot testing & status routes
  fastify.get('/telegram/status', SettingsController.getTelegramStatus);
  fastify.post('/telegram/test-connection', SettingsController.testConnection);
  fastify.post('/telegram/test-message', SettingsController.sendTestMessage);
  fastify.post('/telegram/test-backup', SettingsController.testBackup);
}
