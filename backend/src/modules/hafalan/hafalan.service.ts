import { prisma } from '../../config/database';
import { CreateHafalanInput, UpdateHafalanInput, surahList } from 'shared';
import { AppError } from '../../utils/AppError';
import { DashboardService } from '../dashboard/dashboard.service';

export class HafalanService {
  private buildAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.orgId) {
      return {
        user: { organizationId: user.orgId }
      };
    }
    return { userId: user.userId };
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
    const accessWhere = this.buildAccessWhere(user);
    // 1. Verify Santri ownership & validity
    const santri = await prisma.santri.findFirst({
      where: { id: data.santriId, ...accessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
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

    // 4. Auto-Update / Upsert MurajaahSchedule (BR-02)
    const priorityScore = this.calculatePriorityScore(data.predikat, hafalanDate);

    await prisma.murajaahSchedule.upsert({
      where: {
        santriId_surahNumber: {
          santriId: data.santriId,
          surahNumber: data.surahNumber,
        },
      },
      create: {
        santriId: data.santriId,
        surahNumber: data.surahNumber,
        surahName,
        isSelected: true,
        lastReviewDate: hafalanDate,
        priorityScore,
        userId: user.userId,
      },
      update: {
        lastReviewDate: hafalanDate,
        priorityScore,
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
    predikat?: string
  ) {
    const skip = (page - 1) * limit;
    const accessWhere = this.buildAccessWhere(user);
    
    // For Hafalan, we check if the Hafalan belongs to the user, or if its Santri belongs to the user's org
    const where: any = { ...accessWhere };

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
    const accessWhere = this.buildAccessWhere(user);
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
    const accessWhere = this.buildAccessWhere(user);
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

    // Update MurajaahSchedule if date/predikat changed
    if (data.predikat || data.date) {
      const hafalanDate = updated.date;
      const priorityScore = this.calculatePriorityScore(updated.predikat, hafalanDate);

      await prisma.murajaahSchedule.updateMany({
        where: {
          santriId: updated.santriId,
          surahNumber: updated.surahNumber,
        },
        data: {
          lastReviewDate: hafalanDate,
          priorityScore,
        },
      });
    }

    return updated;
  }

  async deleteHafalan(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);
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
    const accessWhere = this.buildAccessWhere(user);
    const santri = await prisma.santri.findFirst({
      where: { id: data.santriId, ...accessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    const hafalanDate = new Date();
    const records = [];

    for (const surahNumber of data.surahs) {
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
        userId: user.userId,
      });
    }

    if (records.length > 0) {
      await prisma.hafalan.createMany({
        data: records as any, // Cast to any to avoid strict Prisma typing issues with Enum if needed
      });

      // Also upsert Murajaah schedules for these
      for (const r of records) {
        await prisma.murajaahSchedule.upsert({
          where: {
            santriId_surahNumber: {
              santriId: r.santriId,
              surahNumber: r.surahNumber,
            },
          },
          create: {
            santriId: r.santriId,
            surahNumber: r.surahNumber,
            surahName: r.surahName,
            isSelected: true,
            lastReviewDate: hafalanDate,
            priorityScore: this.calculatePriorityScore(r.predikat, hafalanDate),
            userId: user.userId,
          },
          update: {
            lastReviewDate: hafalanDate,
            priorityScore: this.calculatePriorityScore(r.predikat, hafalanDate),
          },
        });
      }

      await DashboardService.invalidateCache(user.userId);
    }

    return { success: true, count: records.length };
  }

  async getRekapGlobal(user: { userId: string, role: string, orgId?: string | null }, page: number = 1, limit: number = 10, search?: string, kelasId?: string) {
    const skip = (page - 1) * limit;

    const accessWhere = this.buildAccessWhere(user);

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
          hafalan: { select: { surahName: true, surahNumber: true, predikat: true } }
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
      
      const uniqueSurahs = Array.from(new Map(hafalan.map((h: any) => [h.surahNumber, h.surahName])).values());
      const surahNames = uniqueSurahs.slice(0, 5);
      const remainingCount = uniqueSurahs.length - 5;
      
      let surahText = surahNames.join(', ');
      if (remainingCount > 0) {
        surahText += `, ... (+${remainingCount} lainnya)`;
      }

      return {
        santriId: s.id,
        santriName: s.name,
        kelasName: s.kelas?.name || '-',
        totalSurah: uniqueSurahs.length,
        surahText: surahText || 'Belum ada hafalan',
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
