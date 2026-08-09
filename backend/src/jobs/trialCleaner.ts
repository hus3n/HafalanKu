import cron from 'node-cron';
import { prisma } from '../config/database';
import { AuditTrail } from '../modules/audit/audit.model';

export function startTrialCleanerJob() {
  // Jalankan setiap jam 00:30 (setengah satu pagi)
  cron.schedule('30 0 * * *', async () => {
    console.log('[TrialCleaner] Running scheduled expired trial account check...');
    try {
      const now = new Date();

      // Cari semua user trial yang activeUntil-nya sudah lewat
      const expiredTrials = await prisma.user.findMany({
        where: {
          isTrial: true,
          activeUntil: {
            lt: now,
          },
        },
      });

      if (expiredTrials.length === 0) {
        console.log('[TrialCleaner] No expired trial accounts found.');
        return;
      }

      console.log(`[TrialCleaner] Found ${expiredTrials.length} expired trial accounts. Deleting...`);

      for (const user of expiredTrials) {
        try {
          // Prisma delete otomatis cascade karena onDelete: Cascade sudah dikonfigurasi di schema.prisma
          await prisma.user.delete({
            where: { id: user.id },
          });

          // Catat di log audit
          await AuditTrail.create({
            userId: 'SYSTEM',
            userName: 'System Cron',
            action: 'DELETE',
            entity: 'USER',
            entityId: user.id,
            oldData: { name: user.name, email: user.email, role: user.role, isTrial: user.isTrial },
            ipAddress: '127.0.0.1',
          });

          console.log(`[TrialCleaner] Successfully deleted trial user: ${user.email}`);
        } catch (err: any) {
          console.error(`[TrialCleaner] Failed to delete user ${user.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('[TrialCleaner] Failed to run trial cleaner job:', err);
    }
  });

  console.log('[TrialCleaner] Cron job scheduled: every day at 00:30 AM');
}
