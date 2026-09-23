import { WhatsAppSession } from '../whatsapp/whatsapp.model';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { getTelegramBot, getTelegramChatId } from '../../config/telegram';
import { env } from '../../config/env';
import { formatSubscriptionPlanText } from 'shared';

export interface NewRegistrationNotificationPayload {
  name: string;
  email: string;
  phone: string;
  role: string;
  organizationName?: string;
  subscriptionPlan?: string;
  isTrial?: boolean;
  createdAt: Date;
}

/**
 * Modular notification dispatcher for new user registrations (WhatsApp & Telegram to Superadmin)
 */
export async function notifySuperadminNewRegistration(data: NewRegistrationNotificationPayload): Promise<void> {
  const timeStr = new Date(data.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const isOrg = data.role === 'ADMIN' || !!data.organizationName;
  const planText = formatSubscriptionPlanText(data.subscriptionPlan, isOrg);

  // 1. Kirim via WhatsApp ke Superadmin
  try {
    const waMessage = 
      `📢 *NOTIFIKASI PENDAFTARAN BARU HAFALANKU*\n\n` +
      `Ada pengguna baru yang baru saja mendaftar & terverifikasi:\n\n` +
      `👤 *Nama:* ${data.name}\n` +
      `📧 *Email:* ${data.email}\n` +
      `📱 *WhatsApp:* ${data.phone}\n` +
      `🔑 *Role:* ${data.role}\n` +
      `🏢 *Lembaga/TPQ:* ${data.organizationName || 'Perorangan'}\n` +
      `⏳ *Pilihan Masa Aktif:* ${planText}\n` +
      `🕒 *Waktu Daftar:* ${timeStr} WIB\n\n` +
      `Silakan login ke *Dashboard Superadmin* (Menu Pengguna Platform) untuk mengaktifkan akun pengguna tersebut.\n\n` +
      `_Pesan otomatis dikirim oleh Sistem HafalanKu._`;

    const activeSession = await WhatsAppSession.findOne({ status: 'CONNECTED' });
    const senderId = activeSession?.userId;
    const superAdminPhone = env.SUPERADMIN_PHONE || '085229925593';
    
    if (senderId && superAdminPhone) {
      const whatsappService = new WhatsAppService();
      await whatsappService.sendMessage(senderId, superAdminPhone, waMessage);
    }
  } catch (waErr: any) {
    console.warn('[AuthNotification] WhatsApp notification to Superadmin skipped/failed:', waErr?.message || waErr);
  }

  // 2. Kirim via Telegram Bot ke Superadmin
  try {
    const bot = getTelegramBot();
    const chatId = getTelegramChatId();
    if (bot && chatId) {
      const tgMessage =
        `📢 *PENDAFTARAN PENGGUNA BARU (TERVERIFIKASI)*\n\n` +
        `Pengguna baru telah mendaftar & memverifikasi email:\n\n` +
        `👤 *Nama:* \`${data.name}\`\n` +
        `📧 *Email:* \`${data.email}\`\n` +
        `📱 *No. HP:* \`${data.phone}\`\n` +
        `🔑 *Role:* \`${data.role}\`\n` +
        `🏢 *Lembaga:* ${data.organizationName || 'Perorangan'}\n` +
        `⏳ *Paket Dipilih:* ${planText}\n` +
        `🕒 *Waktu:* ${timeStr} WIB\n\n` +
        `_Buka menu Superadmin untuk mengaktifkan akun ini._`;

      await bot.sendMessage(chatId, tgMessage, { parse_mode: 'Markdown' });
    }
  } catch (tgErr: any) {
    console.warn('[AuthNotification] Telegram notification to Superadmin skipped/failed:', tgErr?.message || tgErr);
  }
}
