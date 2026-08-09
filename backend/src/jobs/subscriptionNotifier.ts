import cron from 'node-cron';
import { prisma } from '../config/database';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service';
import { NotificationLog } from '../modules/notification/notification.model';
import { decrypt } from '../utils/encryption';
import { env } from '../config/env';

const whatsappService = new WhatsAppService();

export function startSubscriptionNotifierJob() {
  // Jalankan setiap hari jam 08:00
  cron.schedule('0 8 * * *', async () => {
    console.log('[SubscriptionNotifier] Running scheduled active period check...');
    try {
      // Waktu pencarian untuk H-1
      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Cari user (ADMIN atau USER biasa) yang activeUntil-nya besok
      const usersToNotify = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'USER'] },
          activeUntil: {
            gte: tomorrowStart,
            lte: tomorrowEnd,
          },
          isActive: true,
        },
      });

      console.log(`[SubscriptionNotifier] Found ${usersToNotify.length} users expiring tomorrow.`);

      // Ambil id superadmin (default) untuk sender ID di notifikasi
      let superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' },
      });
      const senderId = superAdmin?.id || 'SYSTEM';

      for (const user of usersToNotify) {
        if (!user.phone) {
          console.warn(`[SubscriptionNotifier] User ${user.email} has no phone number, skipping.`);
          continue;
        }

        let phone = user.phone;
        try {
          phone = decrypt(phone);
        } catch (e) {
          // fallback jika tidak terenkripsi
        }

        const dateStr = user.activeUntil?.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // 6285229925593 adalah nomor default sesuai Task-08 (atau ambil dari env nantinya)
        const superAdminPhone = '085229925593';

        const messageText = `Assalamu’alaikum Wr. Wb.\n\nYth. Bapak/Ibu *${user.name}*,\n\nKami informasikan bahwa masa aktif akun ${user.role} Anda di aplikasi HafalanKu akan berakhir besok pada tanggal *${dateStr}*.\n\nMohon segera menghubungi Superadmin (${superAdminPhone}) untuk melakukan perpanjangan langganan agar Anda tetap dapat mengakses aplikasi dengan normal.\n\nTerima kasih.\n\n- *Sistem HafalanKu*`;

        // Retry loop
        let attempts = 0;
        let success = false;
        let lastError = null;

        while (attempts < 3 && !success) {
          attempts++;
          try {
            await whatsappService.sendMessage(senderId, phone, messageText);
            success = true;
          } catch (err: any) {
            lastError = err.message || 'Gagal mengirim WhatsApp';
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Catat di MongoDB
        await NotificationLog.create({
          userId: senderId,
          recipientPhone: phone,
          recipientName: user.name,
          type: 'SUBSCRIPTION_ALERT',
          message: messageText,
          status: success ? 'SENT' : 'FAILED',
          errorMessage: success ? null : lastError,
          retryCount: attempts,
        });

        console.log(`[SubscriptionNotifier] Sent to ${user.email}, success: ${success}`);
        await new Promise((r) => setTimeout(r, 500)); // Delay antar user
      }
    } catch (err) {
      console.error('[SubscriptionNotifier] Failed:', err);
    }
  });

  console.log('[SubscriptionNotifier] Cron job scheduled: every day at 08:00 AM');
}
