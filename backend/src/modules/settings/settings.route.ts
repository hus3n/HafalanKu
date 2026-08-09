import { FastifyInstance } from 'fastify';
import { SettingsController } from './settings.controller';

export async function settingsRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/env', SettingsController.getEnv);
  fastify.put('/env', SettingsController.updateEnv);
}
