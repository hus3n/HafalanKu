import { prisma } from '../../config/database';
import { CreateHafalanInput, UpdateHafalanInput, surahList } from 'shared';
import { AppError } from '../../utils/AppError';
import { DashboardService } from '../dashboard/dashboard.service';

export class HafalanService {
  private buildSantriAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.role === 'ADMIN' && user.orgId) {
      return {
        user: { organizationId: user.orgId }
      };
    }
    // Role USER (Ustadz): strictly santri assigned directly to this ustadz or this ustadz's classes
    return {
      OR: [
        { userId: user.userId },
        { kelas: { userId: user.userId } }
      ]
    };
  }

  private buildHafalanAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.role === 'ADMIN' && user.orgId) {
      return {
        santri: { user: { organizationId: user.orgId } }
      };
    }
    // Role USER (Ustadz): hafalan recorded by ustadz or belonging to santri in ustadz's classes
    return {
      OR: [
        { userId: user.userId },
        { santri: { kelas: { userId: user.userId } } },
        { santri: { userId: user.userId } }
      ]
    };
  }

  private calculatePriorityScore(predikat: string, lastReviewDate: Date): number {
    const daysDiff = Math.floor((Date.now() - new Date(lastReviewDate).getTime()) / (1000 * 60 * 60 * 24));
    const gradeWeights: Record<string, number> = {
      ULANG: 50,
      MAQBUL: 35,
      JAYYID: 20,
      JAYYID_JIDDAN: 10,
      MUMTAZ: 0,
    };

    const weight = gradeWeights[predikat] ?? 10;
    // Higher score = higher priority to review
    return daysDiff + weight;
  }

  async createHafalan(user: { userId: string; role: string; orgId?: string | null }, data: CreateHafalanInput) {
    const santriAccessWhere = this.buildSantriAccessWhere(user);
    // 1. Verify Santri ownership & validity
    const santri = await prisma.santri.findFirst({
      where: { id: data.santriId, ...santriAccessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    // 2. Find Surah Name
    const surah = surahList.find((s) => s.number === data.surahNumber);
    const surahName = surah ? surah.latinName : `Surat ${data.surahNumber}`;

    const hafalanDate = new Date(data.date);

    // 3. Create Hafalan Record
    const hafalan = await prisma.hafalan.create({
      data: {
        santriId: data.santriId,
        surahNumber: data.surahNumber,
        surahName,
        ayatStart: data.ayatStart,
        ayatEnd: data.ayatEnd,
        predikat: data.predikat as any,
        date: hafalanDate,
        notes: data.notes || null,
        userId: user.userId,
      },
    });

    // Invalidate Redis dashboard cache
    await DashboardService.invalidateCache(user.userId);

    return hafalan;
  }

  async getHafalanList(
    user: { userId: string; role: string; orgId?: string | null },
    page: number = 1,
    limit: number = 10,
    santriId?: string,
    surahNumber?: number,
    predikat?: string,
    isHafalanAwal?: boolean
  ) {
    const skip = (page - 1) * limit;
    const accessWhere = this.buildHafalanAccessWhere(user);
    
    // For Hafalan, we check if the Hafalan belongs to the user, or if its Santri belongs to the user's org
    const where: any = { ...accessWhere };

    if (typeof isHafalanAwal === 'boolean') {
      where.isHafalanAwal = isHafalanAwal;
    } else {
      // Default: Riwayat Hafalan page strictly excludes initial bulk hafalan records (isHafalanAwal = false)
      where.isHafalanAwal = false;
    }

    if (santriId) where.santriId = santriId;
    if (surahNumber) where.surahNumber = surahNumber;
    if (predikat) where.predikat = predikat;

    const [total, items] = await Promise.all([
      prisma.hafalan.count({ where }),
      prisma.hafalan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          santri: {
            select: { id: true, name: true }
          }
        }
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHafalanById(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildHafalanAccessWhere(user);
    const hafalan = await prisma.hafalan.findFirst({
      where: { id, ...accessWhere },
      include: {
        santri: {
          select: { id: true, name: true }
        }
      }
    });

    if (!hafalan) {
      throw new AppError('Data hafalan tidak ditemukan', 404);
    }

    return hafalan;
  }

  async updateHafalan(user: { userId: string; role: string; orgId?: string | null }, id: string, data: UpdateHafalanInput) {
    const accessWhere = this.buildHafalanAccessWhere(user);
    const existing = await prisma.hafalan.findFirst({
      where: { id, ...accessWhere },
    });

    if (!existing) {
      throw new AppError('Data hafalan tidak ditemukan', 404);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    if (data.surahNumber) {
      const surah = surahList.find((s) => s.number === data.surahNumber);
      updateData.surahName = surah ? surah.latinName : `Surat ${data.surahNumber}`;
    }

    const updated = await prisma.hafalan.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteHafalan(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildHafalanAccessWhere(user);
    const existing = await prisma.hafalan.findFirst({
      where: { id, ...accessWhere },
    });

    if (!existing) {
      throw new AppError('Data hafalan tidak ditemukan', 404);
    }

    await prisma.hafalan.delete({
      where: { id },
    });

    return { success: true, message: 'Data hafalan berhasil dihapus' };
  }

  async createBulkHafalan(user: { userId: string; role: string; orgId?: string | null }, data: { santriId: string, surahs: number[] }) {
    const santriAccessWhere = this.buildSantriAccessWhere(user);
    const santri = await prisma.santri.findFirst({
      where: { id: data.santriId, ...santriAccessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan atau Anda tidak memiliki akses.', 404);
    }

    if (!data.surahs || !Array.isArray(data.surahs) || data.surahs.length === 0) {
      throw new AppError('Daftar surat tidak boleh kosong.', 400);
    }

    const hafalanDate = new Date();
    const existingHafalan = await prisma.hafalan.findMany({
      where: { santriId: data.santriId, surahNumber: { in: data.surahs } },
      select: { surahNumber: true },
    });
    const existingSurahSet = new Set(existingHafalan.map(h => h.surahNumber));

    const records = [];
    for (const surahNumber of data.surahs) {
      if (existingSurahSet.has(surahNumber)) continue;
      const surah = surahList.find((s) => s.number === surahNumber);
      if (!surah) continue;

      records.push({
        santriId: data.santriId,
        surahNumber,
        surahName: surah.latinName,
        ayatStart: 1,
        ayatEnd: surah.numberOfAyah,
        predikat: 'JAYYID',
        date: hafalanDate,
        isHafalanAwal: true,
        userId: user.userId,
      });
    }

    if (records.length > 0) {
      await prisma.hafalan.createMany({
        data: records as any,
      });

      await DashboardService.invalidateCache(user.userId);
    }

    return { success: true, count: records.length, totalSelected: data.surahs.length };
  }

  async getRekapGlobal(user: { userId: string, role: string, orgId?: string | null }, page: number = 1, limit: number = 10, search?: string, kelasId?: string) {
    const skip = (page - 1) * limit;

    const accessWhere = this.buildSantriAccessWhere(user);

    const where: any = {
      ...accessWhere,
      deletedAt: null,
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (kelasId) {
      where.kelasId = kelasId;
    }

    const [total, santris] = await Promise.all([
      prisma.santri.count({ where }),
      prisma.santri.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          kelas: { select: { name: true } },
          hafalan: { 
            select: { 
              surahName: true, 
              surahNumber: true, 
              ayatStart: true, 
              ayatEnd: true, 
              predikat: true,
              date: true 
            },
            orderBy: { date: 'asc' }
          }
        }
      })
    ]);

    const gradeWeights: Record<string, number> = {
      ULANG: 60,
      MAQBUL: 70,
      JAYYID: 80,
      JAYYID_JIDDAN: 90,
      MUMTAZ: 100,
    };

    const rekapData = santris.map((s: any) => {
      const hafalan = s.hafalan || [];
      const totalScore = hafalan.reduce((sum: number, h: any) => sum + (gradeWeights[h.predikat] || 80), 0);
      const avgScore = hafalan.length > 0 ? Math.round(totalScore / hafalan.length) : 0;
      
      // Group by surahNumber, taking the latest range / formatting ayat
      const surahMap = new Map<number, { name: string; number: number; ayatStart: number; ayatEnd: number }>();
      
      hafalan.forEach((h: any) => {
        surahMap.set(h.surahNumber, {
          name: h.surahName,
          number: h.surahNumber,
          ayatStart: h.ayatStart,
          ayatEnd: h.ayatEnd,
        });
      });

      const uniqueSurahEntries = Array.from(surahMap.values());
      const formattedSurahList = uniqueSurahEntries.map((item) => {
        const surahInfo = surahList.find((surah) => surah.number === item.number);
        const isFullSurah = surahInfo ? (item.ayatStart === 1 && item.ayatEnd === surahInfo.numberOfAyah) : false;
        const displayText = isFullSurah ? item.name : `${item.name} (${item.ayatStart}-${item.ayatEnd})`;
        return {
          number: item.number,
          name: item.name,
          arabicName: surahInfo?.name || '',
          numberOfAyah: surahInfo?.numberOfAyah || item.ayatEnd,
          ayatStart: item.ayatStart,
          ayatEnd: item.ayatEnd,
          isFullSurah,
          displayText,
          juz: item.number >= 78 ? 30 : (item.number >= 67 ? 29 : (item.number >= 58 ? 28 : 1)),
        };
      });

      const surahNames = formattedSurahList.slice(0, 3).map((s) => s.displayText);
      const remainingCount = Math.max(0, formattedSurahList.length - 3);
      
      let surahText = surahNames.join(', ');
      if (remainingCount > 0) {
        surahText += `, +${remainingCount} lainnya`;
      }

      return {
        santriId: s.id,
        santriName: s.name,
        kelasName: s.kelas?.name || '-',
        totalSurah: uniqueSurahEntries.length,
        surahText: surahText || 'Belum ada hafalan',
        surahList: formattedSurahList,
        avgScore
      };
    });

    return {
      data: rekapData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}
