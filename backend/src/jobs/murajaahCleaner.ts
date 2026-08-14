import cron from 'node-cron';
import { MurajaahService } from '../modules/murajaah/murajaah.service';

const murajaahService = new MurajaahService();

export function startMurajaahCleanerJob() {
  // Jalankan tepat saat pergantian hari jam 00:00:05 WIB
  cron.schedule('5 0 * * *', async () => {
    console.log('[MurajaahCleaner] Running midnight murajaah rollover to history...');
    try {
      await murajaahService.cleanupExpiredSchedules();
      console.log('[MurajaahCleaner] Midnight rollover completed.');
    } catch (err) {
      console.error('[MurajaahCleaner] Failed running rollover:', err);
    }
  }, {
    timezone: 'Asia/Jakarta'
  });

  console.log('[MurajaahCleaner] Cron job scheduled: every day at 00:00:05 AM WIB');
}
