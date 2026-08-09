import fs from 'fs';
import path from 'path';
import { AppError } from '../../utils/AppError';

export class SettingsService {
  private envPath = path.resolve(process.cwd(), '.env');

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
    let envContent = '';
    
    // Read existing .env
    if (fs.existsSync(this.envPath)) {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    }

    const updateOrAppend = (key: string, value: string | undefined) => {
      if (value === undefined) return;
      
      const regex = new RegExp(`^${key}=.*`, 'm');
      const newValue = `${key}="${value}"`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newValue);
      } else {
        envContent += `\n${newValue}`;
      }
      
      // Update process.env in memory
      process.env[key] = value;
    };

    updateOrAppend('SUPERADMIN_PHONE', data.superadminPhone);
    updateOrAppend('TELEGRAM_BOT_TOKEN', data.telegramBotToken);
    updateOrAppend('TELEGRAM_CHAT_ID', data.telegramChatId);
    updateOrAppend('WA_GATEWAY_URL', data.waGatewayUrl);

    // Clean up empty lines
    envContent = envContent.replace(/\n{3,}/g, '\n\n').trim();

    // Write back to .env
    fs.writeFileSync(this.envPath, envContent + '\n', 'utf8');

    return this.getEnvSettings();
  }
}
