import { prisma } from '../../config/database';
import { decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';

export class MurajaahService {
  async getSchedules(userId: string, santriId?: string, kelasId?: string) {
    const where: any = { userId };
    if (santriId) {
      where.santriId = santriId;
    }
    if (kelasId) {
      where.santri = { kelasId };
    }

    const schedules = await prisma.murajaahSchedule.findMany({
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
              select: { surahNumber: true, surahName: true, ayatStart: true, ayatEnd: true, date: true },
              orderBy: { surahNumber: 'asc' },
            }
          }
        }
      }
    });

    const now = Date.now();
    const activeSchedules = [];

    for (const item of schedules) {
      const itemTime = new Date(item.updatedAt || item.createdAt).getTime();
      const hoursPassed = (now - itemTime) / (1000 * 60 * 60);

      if (hoursPassed >= 24) {
        let status = item.isSelected ? 'SUDAH' : 'TIDAK_DIMURAJAAH';
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
               }
             });
             await tx.murajaahSchedule.delete({ where: { id: item.id } });
          });
        } catch(e) {
          console.error('[MurajaahService] Error moving schedule to history:', e);
          // If fail, just push it to active temporarily
          activeSchedules.push(item);
        }
      } else {
        activeSchedules.push(item);
      }
    }

    return activeSchedules.map((item: any) => {
      // 1. Group unique hafalan surahs memorized by this santri
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

      // 2. Compute 24-hour expiration status
      const itemTime = new Date(item.updatedAt || item.createdAt).getTime();
      const hoursPassed = (now - itemTime) / (1000 * 60 * 60);

      let murajaahStatus = item.isSelected ? 'SUDAH' : 'BELUM';

      let parentPhone = item.santri?.parentPhone || '081234567890';
      try {
        parentPhone = decrypt(parentPhone);
      } catch (e) {
        // fallback
      }

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
        hafalanSurahs: hafalanSurahs.length > 0 ? hafalanSurahs : [
          { surahNumber: item.surahNumber, surahName: item.surahName, ayatRange: 'Surah Hafalan' }
        ],
        murajaahStatus,
        notificationStatus: item.notificationStatus || 'PENDING',
        lastNotificationSentAt: item.lastNotificationSentAt || null,
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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingToday = await prisma.murajaahSchedule.findFirst({
      where: {
        santriId,
        createdAt: { gte: startOfDay },
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
    const where: any = { userId };
    if (santriId) {
      where.santriId = santriId;
    }
    if (kelasId) {
      where.santri = { kelasId };
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
    const santri = await prisma.santri.findFirst({
      where: { id: santriId, userId, deletedAt: null },
      include: { kelas: true }
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    let parentPhone = santri.parentPhone;
    try {
      parentPhone = decrypt(parentPhone);
    } catch (e) {
      // fallback
    }

    const selectedSchedule = await prisma.murajaahSchedule.findFirst({
      where: { santriId, userId },
      orderBy: { priorityScore: 'desc' },
    });

    const surahNameText = selectedSchedule ? `Surah #${selectedSchedule.surahNumber} ${selectedSchedule.surahName}` : 'Surah Hafalan Terakhir';

    const messageText = `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${santri.parentName}* (Wali dari Ananda *${santri.name}* - ${santri.kelas?.name || 'Kelompok Ustadz'})\n\nBerikut adalah jadwal Murajaah Hafalan Al-Qur'an hari ini:\n📖 Target Murajaah Hari Ini: *${surahNameText}*\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan pendampingan ananda murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* ke nomor Ustadz agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih.\n_HafalanKu Automatic Gateway_`;

    return {
      success: true,
      recipientPhone: parentPhone,
      parentName: santri.parentName,
      santriName: santri.name,
      messagePreview: messageText,
      status: 'SENT_SIMULATED',
    };
  }
}
