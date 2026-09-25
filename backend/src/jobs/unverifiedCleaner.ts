import cron from 'node-cron';
import { prisma } from '../config/database';
import { AuditTrail } from '../modules/audit/audit.model';

export function startUnverifiedCleanerJob() {
  // Run every day at 01:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('[UnverifiedCleaner] Running scheduled check for old unverified accounts...');
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Find all users who are not verified and created more than 3 days ago
      const unverifiedUsers = await prisma.user.findMany({
        where: {
          isEmailVerified: false,
          createdAt: {
            lt: threeDaysAgo,
          },
        },
      });

      if (unverifiedUsers.length === 0) {
        console.log('[UnverifiedCleaner] No old unverified accounts found.');
        return;
      }

      console.log(`[UnverifiedCleaner] Found ${unverifiedUsers.length} old unverified accounts. Deleting...`);

      for (const user of unverifiedUsers) {
        try {
          await prisma.user.delete({
            where: { id: user.id },
          });

          // Log in audit trail
          await AuditTrail.create({
            userId: 'SYSTEM',
            userName: 'System Cron',
            action: 'DELETE',
            entity: 'USER',
            entityId: user.id,
            oldData: { 
              name: user.name, 
              email: user.email, 
              role: user.role, 
              isEmailVerified: user.isEmailVerified, 
              createdAt: user.createdAt 
            },
            ipAddress: '127.0.0.1',
          });

          console.log(`[UnverifiedCleaner] Successfully deleted unverified user: ${user.email}`);
        } catch (err: any) {
          console.error(`[UnverifiedCleaner] Failed to delete user ${user.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[UnverifiedCleaner] Failed to run unverified cleaner job:', err);
    }
  }, {
    timezone: 'Asia/Jakarta'
  });

  console.log('[UnverifiedCleaner] Cron job scheduled: every day at 01:00 AM WIB');
}
