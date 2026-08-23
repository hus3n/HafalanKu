import { prisma } from '../../config/database';

export class PublicService {
  async getLandingStats() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        totalSantri,
        totalOrganizations,
        totalUsers,
        totalHafalan,
        todayHafalan,
        organizations,
        recentHafalanRaw,
      ] = await Promise.all([
        prisma.santri.count({ where: { deletedAt: null } }),
        prisma.organization.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.hafalan.count(),
        prisma.hafalan.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.organization.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        }),
        prisma.hafalan.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            surahName: true,
            surahNumber: true,
            ayatStart: true,
            ayatEnd: true,
            predikat: true,
            createdAt: true,
            santri: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      // Format recent hafalan (safely anonymize for public landing page privacy)
      const recentHafalan = recentHafalanRaw.map((h) => {
        const fullName = h.santri?.name || 'Santri';
        const parts = fullName.trim().split(' ');
        const displayName = parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
        const initials = parts.map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('');

        return {
          id: h.id,
          santriName: displayName,
          initials: initials || 'SN',
          surahName: h.surahName,
          ayatRange: `Ayat ${h.ayatStart} - ${h.ayatEnd}`,
          predikat: h.predikat,
          createdAt: h.createdAt,
        };
      });

      return {
        totalSantri,
        totalOrganizations,
        totalUsers,
        totalHafalan,
        todayHafalan,
        organizations,
        recentHafalan,
      };
    } catch (error) {
      console.error('[PublicService] Error fetching landing stats:', error);
      return {
        totalSantri: 0,
        totalOrganizations: 0,
        totalUsers: 0,
        totalHafalan: 0,
        todayHafalan: 0,
        organizations: [],
        recentHafalan: [],
      };
    }
  }
}

export const publicService = new PublicService();
