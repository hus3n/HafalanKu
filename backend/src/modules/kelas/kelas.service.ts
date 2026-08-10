import { prisma } from '../../config/database';
import { CreateKelasInput } from 'shared';
import { AppError } from '../../utils/AppError';

export class KelasService {
  async createKelas(currentUser: { userId: string; role: string; orgId?: string | null }, data: CreateKelasInput) {
    if (currentUser.role === 'USER' && !currentUser.orgId) {
      const MAX_KELAS_PERORANGAN = 2;
      const count = await prisma.kelas.count({
        where: { userId: currentUser.userId }
      });
      if (count >= MAX_KELAS_PERORANGAN) {
        throw new AppError(`Batas maksimal ${MAX_KELAS_PERORANGAN} kelas untuk pengguna perorangan telah tercapai.`, 403);
      }
    }

    const kelas = await prisma.kelas.create({
      data: {
        name: data.name,
        description: data.description || null,
        userId: data.userId || currentUser.userId,
      },
    });

    return kelas;
  }

  private buildAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.role === 'USER') {
      return { userId: user.userId };
    }
    if (user.orgId) {
      return {
        user: { organizationId: user.orgId }
      };
    }
    return { userId: user.userId };
  }

  async getKelasList(user: { userId: string; role: string; orgId?: string | null }, search?: string) {
    const accessWhere = this.buildAccessWhere(user);
    const where: any = { ...accessWhere };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const kelases = await prisma.kelas.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        user: { select: { id: true, name: true } },
        _count: {
          select: {
            santri: {
              where: { deletedAt: null }
            }
          }
        }
      }
    });

    return kelases.map((k: any) => ({
      id: k.id,
      name: k.name,
      description: k.description,
      userId: k.userId,
      ustadzName: k.user?.name || '-',
      createdAt: k.createdAt,
      totalSantri: k._count.santri,
    }));
  }

  async getKelasById(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);
    const kelas = await prisma.kelas.findFirst({
      where: { id, ...accessWhere },
      include: {
        user: { select: { id: true, name: true } },
        santri: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            parentName: true,
            isActive: true,
          }
        }
      }
    });

    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    return kelas;
  }

  async updateKelas(user: { userId: string; role: string; orgId?: string | null }, id: string, data: Partial<CreateKelasInput>) {
    const accessWhere = this.buildAccessWhere(user);
    const existing = await prisma.kelas.findFirst({
      where: { id, ...accessWhere },
    });

    if (!existing) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    const updated = await prisma.kelas.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.userId && { userId: data.userId }),
      },
    });

    return updated;
  }

  async deleteKelas(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);
    const existing = await prisma.kelas.findFirst({
      where: { id, ...accessWhere },
    });

    if (!existing) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    // Unassign all santri in this class first
    await prisma.santri.updateMany({
      where: { kelasId: id },
      data: { kelasId: null },
    });

    await prisma.kelas.delete({
      where: { id },
    });

    return { success: true, message: 'Kelas berhasil dihapus' };
  }

  async assignSantri(user: { userId: string; role: string; orgId?: string | null }, kelasId: string, santriId: string) {
    const accessWhere = this.buildAccessWhere(user);
    
    // Check kelas ownership
    const kelas = await prisma.kelas.findFirst({
      where: { id: kelasId, ...accessWhere },
    });

    if (!kelas) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    // Check santri ownership
    const santri = await prisma.santri.findFirst({
      where: { id: santriId, ...accessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    // Update santri kelasId (BR-05: 1 santri = 1 kelas, so overwriting handles transfer)
    const updated = await prisma.santri.update({
      where: { id: santriId },
      data: { kelasId },
    });

    return {
      success: true,
      message: `Santri ${santri.name} berhasil dimasukkan ke kelas ${kelas.name}`,
      data: updated,
    };
  }

  async unassignSantri(user: { userId: string; role: string; orgId?: string | null }, kelasId: string, santriId: string) {
    const accessWhere = this.buildAccessWhere(user);
    
    const santri = await prisma.santri.findFirst({
      where: { id: santriId, kelasId, ...accessWhere, deletedAt: null },
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan dalam kelas ini', 404);
    }

    await prisma.santri.update({
      where: { id: santriId },
      data: { kelasId: null },
    });

    return {
      success: true,
      message: `Santri ${santri.name} berhasil dikeluarkan dari kelas`,
    };
  }
}
