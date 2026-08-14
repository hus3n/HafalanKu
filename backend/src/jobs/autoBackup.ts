import cron from 'node-cron';
import { BackupService } from '../modules/backup/backup.service';

const backupService = new BackupService();

export function startAutoBackupJob() {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.warn('[AutoBackup] Telegram not configured, skipping auto-backup scheduler');
    return;
  }
  
  // Jalankan setiap jam tepat (menit 0) WIB
  cron.schedule('0 * * * *', async () => {
    console.log('[AutoBackup] Running scheduled backup...');
    try {
      const result = await backupService.createBackup('system-auto-backup');
      console.log('[AutoBackup] Success:', result.filename);
    } catch (err) {
      console.error('[AutoBackup] Failed:', err);
    }
  }, {
    timezone: 'Asia/Jakarta'
  });
  
  console.log('[AutoBackup] Cron job scheduled: every hour at minute 0');
}
