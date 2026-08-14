import { prisma } from '../../config/database';
import { redis } from '../../config/redis';

export class DashboardService {
  async getStats(userId: string, role: string, orgId?: string | null) {
    const cacheKey = `dashboard:stats:${userId}:${role}`;

    // 1. Try fetching from Redis cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Redis read fallback:', err);
    }

    let result;

    if (role === 'SUPERADMIN') {
      const [totalUsers, totalOrg, totalSantri, totalHafalan] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.organization.count(),
        prisma.santri.count({ where: { deletedAt: null } }),
        prisma.hafalan.count(),
      ]);

      result = {
        role: 'SUPERADMIN',
        stats: [
          { label: 'Total Santri Aktif', value: totalSantri, icon: 'users', color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Organisasi/TPA', value: totalOrg, icon: 'shield', color: 'from-rose-500 to-red-500' },
          { label: 'Total User & Pengajar', value: totalUsers, icon: 'shield', color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Setoran Hafalan', value: totalHafalan, icon: 'book-open', color: 'from-amber-500 to-orange-500' },
        ]
      };
    } else if (role === 'ADMIN') {
      const accessWhere = orgId ? { user: { organizationId: orgId } } : { userId };
      const [totalSantri, totalKelas, totalGuru, totalHafalan] = await Promise.all([
        prisma.santri.count({ where: { ...accessWhere, deletedAt: null } }),
        prisma.kelas.count({ where: { ...accessWhere } }),
        orgId ? prisma.user.count({ where: { organizationId: orgId, role: 'USER', isActive: true } }) : 0,
        prisma.hafalan.count({ where: { ...accessWhere } }),
      ]);

      result = {
        role: 'ADMIN',
        stats: [
          { label: 'Total Santri Aktif', value: totalSantri, icon: 'users', color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Kelas / Kelompok', value: totalKelas, icon: 'building', color: 'from-purple-500 to-pink-500' },
          { label: 'Pengajar / Ustadz', value: totalGuru, icon: 'shield', color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Setoran Hafalan', value: totalHafalan, icon: 'book-open', color: 'from-amber-500 to-orange-500' },
        ]
      };
    } else {
      // Default USER stats
      let accessWhere: any = {};
      if (orgId) {
        accessWhere = { user: { organizationId: orgId } };
      } else {
        accessWhere = { userId };
      }

      const [totalSantri, totalKelas, totalHafalan, totalMurajaah] = await Promise.all([
        prisma.santri.count({ where: { ...accessWhere, deletedAt: null } }),
        prisma.kelas.count({ where: { ...accessWhere } }),
        prisma.hafalan.count({ where: { ...accessWhere } }),
        prisma.murajaahSchedule.count({ where: { ...accessWhere, isSelected: true } }),
      ]);

      result = {
        role: 'USER',
        stats: [
          { label: 'Santri Saya', value: totalSantri, icon: 'graduation-cap', color: 'from-emerald-500 to-teal-500' },
          { label: 'Kelas Saya', value: totalKelas, icon: 'building', color: 'from-purple-500 to-pink-500' },
          { label: 'Total Setoran', value: totalHafalan, icon: 'book-open', color: 'from-amber-500 to-orange-500' },
          { label: 'Jadwal Murajaah Aktif', value: totalMurajaah, icon: 'history', color: 'from-cyan-500 to-blue-500' },
        ]
      };
    }

    // 2. Save result in Redis cache with 300 seconds TTL (5 mins)
    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    } catch (err) {
      console.warn('Redis write fallback:', err);
    }

    return result;
  }

  static async invalidateCache(userId?: string) {
    try {
      if (userId) {
        const keys = await redis.keys(`dashboard:stats:${userId}:*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        const keys = await redis.keys('dashboard:stats:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    } catch (err) {
      console.warn('Redis cache invalidation fallback:', err);
    }
  }
}
