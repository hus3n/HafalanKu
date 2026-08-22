import fs from 'fs';
import path from 'path';
import { 
  getTelegramBot, 
  getTelegramChatId, 
  reloadTelegramBot, 
  testTelegramConnection, 
  sendTelegramTestMessage 
} from '../../config/telegram';
import { restartAutoBackupJob } from '../../jobs/autoBackup';
import { BackupService } from '../backup/backup.service';

export class SettingsService {
  private backupService = new BackupService();

  /**
   * Mengumpulkan semua lokasi file .env yang mungkin digunakan di sistem
   */
  private getEnvFilePaths(): string[] {
    const candidatePaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'backend', '.env'),
      path.resolve(__dirname, '../../../.env'),
      path.resolve(__dirname, '../../../../.env'),
    ];

    // Ambil path yang unik dan benar-benar ada di filesystem
    const uniquePaths = Array.from(new Set(candidatePaths));
    const existingPaths = uniquePaths.filter((p) => fs.existsSync(p));

    // Jika tidak ada yang ditemukan, fallback ke process.cwd()/.env
    if (existingPaths.length === 0) {
      existingPaths.push(path.resolve(process.cwd(), '.env'));
    }

    return existingPaths;
  }

  async getEnvSettings() {
    return {
      superadminPhone: process.env.SUPERADMIN_PHONE || '085229925593',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
      waGatewayUrl: process.env.WA_GATEWAY_URL || '',
    };
  }

  async updateEnvSettings(data: {
    superadminPhone?: string;
    telegramBotToken?: string;
    telegramChatId?: string;
    waGatewayUrl?: string;
  }) {
    const envPaths = this.getEnvFilePaths();

    // Sanitasi input (trim spasi berlebih)
    const sanitizedData = {
      SUPERADMIN_PHONE: data.superadminPhone !== undefined ? data.superadminPhone.trim() : undefined,
      TELEGRAM_BOT_TOKEN: data.telegramBotToken !== undefined ? data.telegramBotToken.trim().replace(/^["']|["']$/g, '') : undefined,
      TELEGRAM_CHAT_ID: data.telegramChatId !== undefined ? data.telegramChatId.trim().replace(/^["']|["']$/g, '') : undefined,
      WA_GATEWAY_URL: data.waGatewayUrl !== undefined ? data.waGatewayUrl.trim().replace(/^["']|["']$/g, '') : undefined,
    };

    // Update process.env dalam memori langsung
    Object.entries(sanitizedData).forEach(([key, val]) => {
      if (val !== undefined) {
        process.env[key] = val;
      }
    });

    // Tulis ke semua file .env yang terdeteksi
    for (const filePath of envPaths) {
      try {
        let envContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

        const updateOrAppend = (key: string, value: string | undefined) => {
          if (value === undefined) return;
          const regex = new RegExp(`^${key}=.*`, 'm');
          const newValue = `${key}="${value}"`;

          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, newValue);
          } else {
            envContent += `\n${newValue}`;
          }
        };

        updateOrAppend('SUPERADMIN_PHONE', sanitizedData.SUPERADMIN_PHONE);
        updateOrAppend('TELEGRAM_BOT_TOKEN', sanitizedData.TELEGRAM_BOT_TOKEN);
        updateOrAppend('TELEGRAM_CHAT_ID', sanitizedData.TELEGRAM_CHAT_ID);
        updateOrAppend('WA_GATEWAY_URL', sanitizedData.WA_GATEWAY_URL);

        envContent = envContent.replace(/\n{3,}/g, '\n\n').trim();
        fs.writeFileSync(filePath, envContent + '\n', 'utf8');
        console.log(`[Settings] Updated environment configuration in: ${filePath}`);
      } catch (err) {
        console.error(`[Settings] Error updating ${filePath}:`, err);
      }
    }

    // Refresh Telegram bot singleton instance
    reloadTelegramBot();

    // Restart Auto Backup cron scheduler dengan konfigurasi baru
    restartAutoBackupJob();

    return this.getEnvSettings();
  }

  /**
   * Cek status konektivitas Telegram Bot saat ini
   */
  async getTelegramStatus() {
    const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chatId = getTelegramChatId();
    const isConfigured = Boolean(token && token !== '123456789:ABCdefGHIjklMNOpqrsTUVwxyz');

    if (!isConfigured) {
      return {
        configured: false,
        connected: false,
        botInfo: null,
        chatId: chatId || null,
        error: 'Token bot belum dikonfigurasi',
        lastChecked: new Date().toISOString(),
      };
    }

    const testRes = await testTelegramConnection();

    return {
      configured: true,
      connected: testRes.success,
      botInfo: testRes.botInfo || null,
      chatId: chatId || null,
      error: testRes.error || null,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Tes token Telegram secara spesifik
   */
  async testConnection(customToken?: string) {
    return await testTelegramConnection(customToken);
  }

  /**
   * Kirim pesan tes ke Chat ID
   */
  async sendTestMessage(customChatId?: string) {
    return await sendTelegramTestMessage(customChatId);
  }

  /**
   * Uji coba backup manual dan kirim langsung ke Telegram Bot
   */
  async testBackupToTelegram(userId: string) {
    const backupResult = await this.backupService.createBackup(userId);
    const bot = getTelegramBot();
    const chatId = getTelegramChatId();

    return {
      success: true,
      message: 'Uji coba proses backup & kirim ke Telegram telah dijalankan',
      backup: backupResult,
      telegramConfigured: Boolean(bot && chatId),
    };
  }
}
