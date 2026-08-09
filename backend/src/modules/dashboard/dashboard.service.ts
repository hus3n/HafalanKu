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
      const [totalUsers, totalOrg] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.organization.count(),
      ]);

      result = {
        role: 'SUPERADMIN',
        stats: [
          { label: 'Total User Active', value: totalUsers, icon: 'users', color: 'from-blue-500 to-indigo-500' },
          { label: 'Total Organisasi/TPA', value: totalOrg, icon: 'shield', color: 'from-rose-500 to-red-500' },
        ]
      };
    } else if (role === 'ADMIN') {
      const totalGuru = orgId 
        ? await prisma.user.count({ where: { organizationId: orgId, role: 'USER' } })
        : 0;
        
      const totalAdmin = orgId
        ? await prisma.user.count({ where: { organizationId: orgId, role: 'ADMIN' } })
        : 0;

      result = {
        role: 'ADMIN',
        stats: [
          { label: 'Pengajar / Ustadz', value: totalGuru, icon: 'users', color: 'from-emerald-500 to-teal-500' },
          { label: 'Admin Organisasi', value: totalAdmin, icon: 'shield', color: 'from-blue-500 to-indigo-500' },
        ]
      };
    } else {
      // Default USER stats
      const [totalSantri, totalKelas, totalHafalan, totalMurajaah] = await Promise.all([
        prisma.santri.count({ where: { userId, deletedAt: null } }),
        prisma.kelas.count({ where: { userId } }),
        prisma.hafalan.count({ where: { userId } }),
        prisma.murajaahSchedule.count({ where: { userId, isSelected: true } }),
      ]);

      result = {
        role: 'USER',
        stats: [
          { label: 'Santri Saya', value: totalSantri, icon: 'graduation-cap', color: 'from-emerald-500 to-teal-500' },
          { label: 'Kelas Saya', value: totalKelas, icon: 'building', color: 'from-purple-500 to-pink-500' },
          { label: 'Total Setoran', value: totalHafalan, icon: 'book-open', color: 'from-amber-500 to-orange-500' },
          { label: 'Jadwal Murajaah Active', value: totalMurajaah, icon: 'history', color: 'from-cyan-500 to-blue-500' },
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
