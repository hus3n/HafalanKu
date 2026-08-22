import cron, { ScheduledTask } from 'node-cron';
import { BackupService } from '../modules/backup/backup.service';

const backupService = new BackupService();
let cronTask: ScheduledTask | null = null;

export function startAutoBackupJob() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }

  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  const isTelegramReady = Boolean(token && token !== '123456789:ABCdefGHIjklMNOpqrsTUVwxyz' && chatId && chatId !== '-1001234567890');

  console.log(`[AutoBackup] Initializing cron scheduler... (Telegram Cloud Sync: ${isTelegramReady ? 'Active' : 'Awaiting Config'})`);

  // Jalankan setiap jam tepat (menit 0) WIB
  cronTask = cron.schedule('0 * * * *', async () => {
    console.log('[AutoBackup] Running scheduled automatic backup...');
    try {
      const result = await backupService.createBackup('system-auto-backup');
      console.log('[AutoBackup] Success created backup:', result.filename);
    } catch (err) {
      console.error('[AutoBackup] Failed running auto backup:', err);
    }
  }, {
    timezone: 'Asia/Jakarta'
  });

  console.log('[AutoBackup] Cron job successfully registered (Every hour at minute 0 WIB)');
}

export function restartAutoBackupJob() {
  console.log('[AutoBackup] Restarting auto-backup cron job with latest configuration...');
  startAutoBackupJob();
}
