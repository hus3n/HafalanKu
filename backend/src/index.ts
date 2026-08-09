import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { connectMongoDB, disconnectDatabases } from './config/database';
import { corsConfig } from './config/cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { loggerConfig } from './middleware/logger';
import authPlugin from './plugins/auth';
import rateLimiterPlugin from './plugins/rateLimiter';
import rbacPlugin from './plugins/rbac';

import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { santriRoutes } from './modules/santri/santri.routes';
import { kelasRoutes } from './modules/kelas/kelas.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { hafalanRoutes } from './modules/hafalan/hafalan.routes';
import { murajaahRoutes } from './modules/murajaah/murajaah.routes';
import { whatsappRoutes } from './modules/whatsapp/whatsapp.routes';
import { notificationRoutes } from './modules/notification/notification.routes';
import { reportRoutes } from './modules/report/report.routes';
import { backupRoutes } from './modules/backup/backup.routes';
import { masterRoutes } from './modules/master/master.routes';
import { settingsRoutes } from './modules/settings/settings.route';
import { startAutoBackupJob } from './jobs/autoBackup';
import { startSubscriptionNotifierJob } from './jobs/subscriptionNotifier';
import { startTrialCleanerJob } from './jobs/trialCleaner';

const fastify = Fastify({
  logger: loggerConfig,
  bodyLimit: 10 * 1024 * 1024, // 10MB limit for image base64 uploads
});

async function main() {
  try {
    // Connect to databases
    await connectMongoDB();

    // Register security and core plugins
    await fastify.register(helmet);
    await fastify.register(cors, corsConfig);
    
    // Register custom helper plugins
    await fastify.register(authPlugin);
    await fastify.register(rbacPlugin);
    await fastify.register(rateLimiterPlugin);

    // Set global error handler
    fastify.setErrorHandler(errorHandler);

    // Base routes
    fastify.get('/health', async () => {
      return { success: true, message: 'OK' };
    });

    fastify.get('/api/v1/health', async () => {
      return { success: true, message: 'HafalanKu API v1 is healthy' };
    });

    // Register API v1 routes
    await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
    await fastify.register(userRoutes, { prefix: '/api/v1/users' });
    await fastify.register(santriRoutes, { prefix: '/api/v1/santri' });
    await fastify.register(kelasRoutes, { prefix: '/api/v1/kelas' });
    await fastify.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
    await fastify.register(hafalanRoutes, { prefix: '/api/v1/hafalan' });
    await fastify.register(murajaahRoutes, { prefix: '/api/v1/murajaah' });
    await fastify.register(whatsappRoutes, { prefix: '/api/v1/whatsapp' });
    await fastify.register(notificationRoutes, { prefix: '/api/v1/notifications' });
    await fastify.register(reportRoutes, { prefix: '/api/v1/reports' });
    await fastify.register(backupRoutes, { prefix: '/api/v1/backup' });
    await fastify.register(masterRoutes, { prefix: '/api/v1/master' });
    await fastify.register(settingsRoutes, { prefix: '/api/v1/settings' });
    // Start Fastify server
    const address = await fastify.listen({
      port: env.BACKEND_PORT,
      host: '0.0.0.0',
    });
    
    console.log(`🚀 Server listening on ${address}`);

    // Auto-restore active WhatsApp sessions on boot
    const { WhatsAppService } = require('./modules/whatsapp/whatsapp.service');
    const waService = new WhatsAppService();
    waService.autoRestoreSessions().catch((e: any) => console.error('[WA Boot] Error restoring sessions:', e));

    // Start Auto Backup Cron Job
    startAutoBackupJob();

    // Start Subscription Expiration Notifier Cron Job
    startSubscriptionNotifierJob();

    // Start Trial Cleaner Cron Job
    startTrialCleanerJob();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdowns
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
      await fastify.close();
      await disconnectDatabases();
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
});

main();
