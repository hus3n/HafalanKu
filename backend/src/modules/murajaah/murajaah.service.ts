import { prisma } from '../../config/database';
import { decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationLog } from '../notification/notification.model';

const whatsappService = new WhatsAppService();

function getStartOfTodayJakarta(): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayJakartaStr = formatter.format(new Date()); // "YYYY-MM-DD"
  return new Date(`${todayJakartaStr}T00:00:00.000+07:00`);
}

export class MurajaahService {
  async cleanupExpiredSchedules() {
    const startOfToday = getStartOfTodayJakarta();

    const expiredSchedules = await prisma.murajaahSchedule.findMany({
      where: {
        createdAt: { lt: startOfToday },
      },
    });

    if (expiredSchedules.length > 0) {
      console.log(`[MurajaahService] Moving ${expiredSchedules.length} expired murajaah schedules from previous calendar days to history...`);
      for (const item of expiredSchedules) {
        const status = item.isSelected ? 'SUDAH' : 'TIDAK_DIMURAJAAH';
        try {
          await prisma.$transaction(async (tx) => {
            await tx.murajaahHistory.create({
              data: {
                santriId: item.santriId,
                surahNumber: item.surahNumber,
                surahName: item.surahName,
                status,
                date: item.createdAt,
                userId: item.userId,
              },
            });
            await tx.murajaahSchedule.delete({ where: { id: item.id } });
          });
        } catch (e) {
          console.error(`[MurajaahService] Error moving expired schedule ${item.id} to history:`, e);
        }
      }
    }
  }

  async getSchedules(userId: string, santriId?: string, kelasId?: string) {
    // 1. Move all previous calendar days' schedules to history
    await this.cleanupExpiredSchedules();

    const startOfToday = getStartOfTodayJakarta();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true }
    });

    let accessWhere: any = {};
    if (user?.role === 'SUPERADMIN') {
      accessWhere = {};
    } else if (user?.role === 'ADMIN' && user.organizationId) {
      accessWhere = {
        santri: {
          user: { organizationId: user.organizationId }
        }
      };
    } else {
      accessWhere = {
        OR: [
          { userId },
          { santri: { OR: [{ userId }, { kelas: { userId } }] } }
        ]
      };
    }

    const where: any = {
      ...accessWhere,
      createdAt: { gte: startOfToday }, // Only show today's calendar day schedules
    };
    if (santriId) {
      where.santriId = santriId;
    }
    if (kelasId) {
      where.santri = { ...(where.santri || {}), kelasId };
    }

    const activeSchedules = await prisma.murajaahSchedule.findMany({
      where,
      orderBy: [
        { isSelected: 'desc' },
        { priorityScore: 'desc' },
      ],
      include: {
        santri: {
          select: { 
            id: true, 
            name: true,
            parentName: true,
            parentPhone: true,
            kelas: { select: { id: true, name: true } },
            hafalan: {
              select: { surahNumber: true, surahName: true, ayatStart: true, ayatEnd: true, date: true, isHafalanAwal: true },
              orderBy: { surahNumber: 'asc' },
            }
          }
        }
      }
    });

    // Query today's notification logs from MongoDB to determine notification status accurately
    const notifiedSantriIds = new Set<string>();
    const logTimestamps = new Map<string, string>();
    try {
      const santriIdList = activeSchedules.map((s) => s.santriId);
      if (santriIdList.length > 0) {
        const todayLogs = await NotificationLog.find({
          type: 'MURAJAAH_SCHEDULE',
          status: 'SENT',
          santriId: { $in: santriIdList },
          createdAt: { $gte: startOfToday }
        });
        todayLogs.forEach((l) => {
          if (l.santriId) {
            notifiedSantriIds.add(l.santriId);
            logTimestamps.set(l.santriId, l.createdAt.toISOString());
          }
        });
      }
    } catch (e) {
      console.error('[MurajaahService] Error querying NotificationLog in getSchedules:', e);
    }

    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
    const todayStr = formatter.format(new Date());

    return activeSchedules.map((item: any) => {
      // 1. Group unique hafalan surahs memorized by this santri (all surahs for choosing target)
      const hafalanMap = new Map<number, any>();
      const santriHafalanList = item.santri?.hafalan || [];
      if (santriHafalanList) {
        for (const h of santriHafalanList) {
          if (!hafalanMap.has(h.surahNumber)) {
            hafalanMap.set(h.surahNumber, {
              surahNumber: h.surahNumber,
              surahName: h.surahName,
              ayatRange: `Ayat ${h.ayatStart} - ${h.ayatEnd}`,
              lastHafalanDate: h.date,
            });
          }
        }
      }

      const hafalanSurahs = Array.from(hafalanMap.values());

      // 2. Identify strictly REAL NEW SETORANS (isHafalanAwal = false) for today's setoran report
      const realSetoranList = santriHafalanList.filter((h: any) => !h.isHafalanAwal);
      const todayHafalanList = realSetoranList.filter((h: any) => {
        if (!h.date) return false;
        const dStr = formatter.format(new Date(h.date));
        return dStr === todayStr;
      });

      const latestHafalan = realSetoranList.length > 0 ? realSetoranList[realSetoranList.length - 1] : null;

      let hafalanTodayText = '';
      if (todayHafalanList.length > 0) {
        hafalanTodayText = todayHafalanList.map((h: any) => `Surah #${h.surahNumber} ${h.surahName} (Ayat ${h.ayatStart}-${h.ayatEnd})`).join(', ');
      } else if (latestHafalan) {
        hafalanTodayText = `Surah #${latestHafalan.surahNumber} ${latestHafalan.surahName} (Ayat ${latestHafalan.ayatStart}-${latestHafalan.ayatEnd})`;
      } else {
        hafalanTodayText = 'Belum ada setoran baru hari ini';
      }

      let murajaahStatus = item.isSelected ? 'SUDAH' : 'BELUM';

      let parentPhone = item.santri?.parentPhone || '081234567890';
      try {
        parentPhone = decrypt(parentPhone);
      } catch (e) {
        // fallback
      }

      const isNotified = notifiedSantriIds.has(item.santriId);

      return {
        id: item.id,
        date: item.createdAt,
        santriId: item.santriId,
        santriName: item.santri?.name || 'Santri',
        parentName: item.santri?.parentName || 'Wali Santri',
        parentPhone,
        kelasId: item.santri?.kelas?.id || '',
        kelasName: item.santri?.kelas?.name || 'Kelompok Ustadz',
        selectedSurahNumber: item.surahNumber,
        selectedSurahName: item.surahName,
        surahNumber: item.surahNumber,
        surahName: item.surahName,
        isSelected: item.isSelected,
        priorityScore: item.priorityScore,
        lastReviewDate: item.lastReviewDate,
        hafalanTodayText,
        hafalanSurahs: hafalanSurahs.length > 0 ? hafalanSurahs : [
          { surahNumber: item.surahNumber, surahName: item.surahName, ayatRange: 'Surah Hafalan' }
        ],
        murajaahStatus,
        notificationStatus: isNotified ? 'SENT' : 'PENDING',
        lastNotificationSentAt: logTimestamps.get(item.santriId) || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  async updateScheduleSurah(userId: string, id: string, surahNumber: number, surahName: string) {
    const existing = await prisma.murajaahSchedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Jadwal murajaah tidak ditemukan', 404);
    }

    const updated = await prisma.murajaahSchedule.update({
      where: { id },
      data: {
        surahNumber,
        surahName,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async toggleSchedule(userId: string, id: string) {
    const existing = await prisma.murajaahSchedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Jadwal murajaah tidak ditemukan', 404);
    }

    const updated = await prisma.murajaahSchedule.update({
      where: { id },
      data: {
        isSelected: !existing.isSelected,
        lastReviewDate: !existing.isSelected ? new Date() : existing.lastReviewDate,
      },
    });

    return updated;
  }

  async createSchedule(userId: string, santriId: string, surahNumber: number, surahName: string) {
    // 1. Move all previous days' schedules to history before checking/creating
    await this.cleanupExpiredSchedules();

    const startOfToday = getStartOfTodayJakarta();

    const existingToday = await prisma.murajaahSchedule.findFirst({
      where: {
        santriId,
        createdAt: { gte: startOfToday },
      },
    });

    if (existingToday) {
      throw new AppError('Santri ini sudah memiliki 1 jadwal murajaah pada hari ini. Silakan hapus jadwal sebelumnya jika ingin mengganti.', 400);
    }

    const schedule = await prisma.murajaahSchedule.create({
      data: {
        userId,
        santriId,
        surahNumber,
        surahName,
        isSelected: false,
      }
    });

    return schedule;
  }

  async deleteSchedule(userId: string, id: string) {
    const existing = await prisma.murajaahSchedule.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('Jadwal murajaah tidak ditemukan', 404);
    }

    await prisma.murajaahSchedule.delete({
      where: { id },
    });

    return { success: true, message: 'Jadwal murajaah berhasil dihapus' };
  }

  async getHistory(userId: string, santriId?: string, kelasId?: string) {
    // 1. Move all previous days' schedules to history so history is always current
    await this.cleanupExpiredSchedules();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true }
    });

    let accessWhere: any = {};
    if (user?.role === 'SUPERADMIN') {
      accessWhere = {};
    } else if (user?.role === 'ADMIN' && user.organizationId) {
      accessWhere = {
        santri: {
          user: { organizationId: user.organizationId }
        }
      };
    } else {
      accessWhere = {
        OR: [
          { userId },
          { santri: { OR: [{ userId }, { kelas: { userId } }] } }
        ]
      };
    }

    const where: any = { ...accessWhere };
    if (santriId) {
      where.santriId = santriId;
    }
    if (kelasId) {
      where.santri = { ...(where.santri || {}), kelasId };
    }

    const histories = await prisma.murajaahHistory.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        santri: {
          select: {
            name: true,
            parentName: true,
            kelas: { select: { id: true, name: true } }
          }
        }
      }
    });

    return histories.map((h: any) => ({
      id: h.id,
      date: h.date,
      santriId: h.santriId,
      santriName: h.santri?.name || 'Santri',
      parentName: h.santri?.parentName || 'Wali',
      kelasName: h.santri?.kelas?.name || '-',
      surahNumber: h.surahNumber,
      surahName: h.surahName,
      status: h.status,
    }));
  }

  async sendScheduleToWhatsApp(userId: string, santriId: string) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true }
    });

    let santriAccessWhere: any = {};
    if (currentUser?.role === 'SUPERADMIN') {
      santriAccessWhere = {};
    } else if (currentUser?.role === 'ADMIN' && currentUser.organizationId) {
      santriAccessWhere = {
        user: { organizationId: currentUser.organizationId }
      };
    } else {
      santriAccessWhere = {
        OR: [
          { userId },
          { kelas: { userId } }
        ]
      };
    }

    const santri = await prisma.santri.findFirst({
      where: {
        id: santriId,
        ...santriAccessWhere,
      },
      include: {
        kelas: true,
        hafalan: {
          where: { isHafalanAwal: false },
          orderBy: { date: 'desc' },
          take: 5,
        },
      }
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    let parentPhone = santri.parentPhone;
    try {
      parentPhone = decrypt(parentPhone);
    } catch (e) {
      // fallback
    }

    if (!parentPhone) {
      throw new AppError('Nomor WhatsApp Wali Santri belum terdaftar.', 400);
    }

    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' });
    const todayStr = formatter.format(new Date());

    const todayHafalan = santri.hafalan.filter(h => {
      if (!h.date) return false;
      const dStr = formatter.format(new Date(h.date));
      return dStr === todayStr;
    });

    let hafalanText = '';
    if (todayHafalan.length > 0) {
      hafalanText = todayHafalan.map(h => `- Surah #${h.surahNumber} ${h.surahName} (Ayat ${h.ayatStart}-${h.ayatEnd})`).join('\n');
    } else if (santri.hafalan.length > 0) {
      const latest = santri.hafalan[0];
      hafalanText = `- Surah #${latest.surahNumber} ${latest.surahName} (Ayat ${latest.ayatStart}-${latest.ayatEnd}) *(Setoran Terakhir)*`;
    } else {
      hafalanText = '- Belum ada catatan setoran baru';
    }

    const selectedSchedule = await prisma.murajaahSchedule.findFirst({
      where: { santriId },
      orderBy: { priorityScore: 'desc' },
    });

    const surahNameText = selectedSchedule ? `Surah #${selectedSchedule.surahNumber} ${selectedSchedule.surahName}` : 'Surah Pilihan';

    const messageText = `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${santri.parentName}* (Wali dari Ananda *${santri.name}* - ${santri.kelas?.name || 'Kelompok Ustadz'})\n\nBerikut adalah laporan capaian hafalan dan jadwal murajaah ananda hari ini:\n\n📜 *Setoran Hafalan Hari Ini:*\n${hafalanText}\n\n📖 *Target Murajaah di Rumah:*\n*${surahNameText}*\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan dampingi ananda mengulang murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih atas perhatian dan kerja samanya.\n_HafalanKu Automatic Gateway_`;

    // 1. Attempt sending with current user session
    let sendResult = await whatsappService.sendMessage(userId, parentPhone, messageText);

    // 2. Fallback: If current user's WA is not connected and user is in an organization, try organization admin session
    if (!sendResult.success && currentUser?.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        select: { adminId: true }
      });
      if (org?.adminId && org.adminId !== userId) {
        console.log(`[MurajaahService] WA Ustadz ${userId} belum aktif, mencoba sesi WA Admin Organisasi ${org.adminId}...`);
        const orgSend = await whatsappService.sendMessage(org.adminId, parentPhone, messageText);
        if (orgSend.success) {
          sendResult = orgSend;
        }
      }
    }

    // 3. Log to MongoDB NotificationLog
    try {
      await NotificationLog.create({
        userId,
        santriId,
        recipientPhone: parentPhone,
        recipientName: santri.parentName,
        type: 'MURAJAAH_SCHEDULE',
        message: messageText,
        status: sendResult.success ? 'SENT' : 'FAILED',
        errorMessage: sendResult.success ? null : (sendResult.error || 'Gagal mengirim pesan WhatsApp'),
        retryCount: 1,
      });
    } catch (err) {
      console.error('[MurajaahService] Failed logging notification to MongoDB:', err);
    }

    return {
      success: sendResult.success,
      recipientPhone: parentPhone,
      parentName: santri.parentName,
      santriName: santri.name,
      messagePreview: messageText,
      status: sendResult.success ? 'SENT' : 'FAILED',
      error: sendResult.success ? null : (sendResult.error || 'WhatsApp belum terhubung atau nomor tidak terdaftar.'),
    };
  }

  async sendBatchScheduleToWhatsApp(userId: string, santriIds: string[]) {
    const results = [];
    for (let i = 0; i < santriIds.length; i++) {
      const santriId = santriIds[i];
      try {
        const res = await this.sendScheduleToWhatsApp(userId, santriId);
        results.push({ santriId, ...res });
      } catch (err: any) {
        results.push({
          santriId,
          success: false,
          status: 'FAILED',
          error: err.message || 'Gagal memproses pengiriman WhatsApp',
        });
      }

      // Anti-spam staggered delay (randomly 10, 15, or 20 seconds) if more items remain
      if (i < santriIds.length - 1) {
        const delays = [10, 15, 20];
        const randomDelay = delays[Math.floor(Math.random() * delays.length)];
        await new Promise((r) => setTimeout(r, randomDelay * 1000));
      }
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      total: santriIds.length,
      successful,
      failed,
      details: results,
    };
  }

  async simulateParentReply(userId: string, santriId: string, message: string = 'sudah') {
    if (!message.toLowerCase().includes('sudah') && !message.toLowerCase().includes('sdh')) {
      return { success: false, message: 'Pesan balasan tidak mengandung kata kunci "sudah"' };
    }

    const updated = await prisma.murajaahSchedule.updateMany({
      where: {
        santriId,
      },
      data: {
        isSelected: true,
        lastReviewDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Status murajaah santri berhasil diperbarui menjadi Sudah Dimurajaah (${updated.count} jadwal terupdate)`,
      updatedCount: updated.count,
    };
  }
}
