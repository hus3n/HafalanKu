import { NotificationLog } from './notification.model';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { prisma } from '../../config/database';
import { decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';

const whatsappService = new WhatsAppService();

export class NotificationService {
  async sendNotification(
    userId: string,
    santriId: string,
    type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE',
    customMessage?: string
  ) {
    // 1. Fetch Santri info
    const santri = await prisma.santri.findFirst({
      where: { id: santriId, userId, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    let phone = santri.parentPhone;
    try {
      phone = decrypt(phone);
    } catch (e) {
      // Fallback
    }

    // 2. Format Message if customMessage not provided
    let messageText = customMessage;
    if (!messageText) {
      if (type === 'HAFALAN_NEW') {
        const latestHafalan = await prisma.hafalan.findFirst({
          where: { santriId, userId },
          orderBy: { createdAt: 'desc' },
        });

        messageText = `Assalamu’alaikum Wr. Wb.\n\nYth. Bapak/Ibu Wali dari *${santri.name}*,\n\nAlhamdulillah, Ananda telah menyelesaikan setoran hafalan baru:\n📖 *QS. ${latestHafalan?.surahName || 'Al-Qur\'an'}* (Ayat ${latestHafalan?.ayatStart || 1}-${latestHafalan?.ayatEnd || 1})\n🌟 Predikat: *${latestHafalan?.predikat || 'MUMTAZ'}*\n\nMohon apresiasinya untuk Ananda di rumah. Bararakallahu feekum. 🤲\n\n- *Tim HafalanKu*`;
      } else {
        messageText = `Assalamu’alaikum Wr. Wb.\n\nYth. Bapak/Ibu Wali dari *${santri.name}*,\n\nBerikut pengingat jadwal murajaah harian Ananda hari ini. Silakan periksa melalui aplikasi HafalanKu.\n\nTerima kasih atas bimbingannya. 🤲✨`;
      }
    }

    // 3. Retry loop (up to 3 retries)
    let attempts = 0;
    let success = false;
    let lastError = null;

    while (attempts < 3 && !success) {
      attempts++;
      try {
        await whatsappService.sendMessage(userId, phone, messageText);
        success = true;
      } catch (err: any) {
        lastError = err.message || 'Gagal mengirim WhatsApp';
        // wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // 4. Log result to MongoDB
    const log = await NotificationLog.create({
      userId,
      santriId,
      recipientPhone: phone,
      recipientName: santri.parentName,
      type,
      message: messageText,
      status: success ? 'SENT' : 'FAILED',
      errorMessage: success ? null : lastError,
      retryCount: attempts,
    });

    return {
      success,
      logId: log._id,
      recipientPhone: phone,
      status: success ? 'SENT' : 'FAILED',
      attempts,
    };
  }

  async sendBulkNotifications(
    userId: string,
    santriIds: string[],
    type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE',
    customMessage?: string
  ) {
    const results = [];
    for (const id of santriIds) {
      try {
        const res = await this.sendNotification(userId, id, type, customMessage);
        results.push(res);
        // Small delay to prevent rate limit
        await new Promise((r) => setTimeout(r, 200));
      } catch (err: any) {
        results.push({ santriId: id, success: false, error: err.message });
      }
    }

    return {
      total: santriIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      details: results,
    };
  }

  async getNotificationHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    type?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { userId };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const [total, logs] = await Promise.all([
      NotificationLog.countDocuments(filter),
      NotificationLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
