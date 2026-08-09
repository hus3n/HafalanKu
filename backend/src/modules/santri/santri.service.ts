import { prisma } from '../../config/database';
import { CreateSantriInput, UpdateSantriInput } from 'shared';
import { encrypt, decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';

export class SantriService {
  async createSantri(currentUser: { userId: string; role: string; orgId?: string | null }, data: CreateSantriInput) {
    if (currentUser.role === 'USER' && !currentUser.orgId) {
      const MAX_SANTRI_PERORANGAN = 20;
      const count = await prisma.santri.count({
        where: { userId: currentUser.userId, deletedAt: null }
      });
      if (count >= MAX_SANTRI_PERORANGAN) {
        throw new AppError(`Batas maksimal ${MAX_SANTRI_PERORANGAN} santri untuk pengguna perorangan telah tercapai.`, 403);
      }
    }

    // Encrypt parent phone
    const encryptedPhone = encrypt(data.parentPhone);

    const santri = await prisma.santri.create({
      data: {
        name: data.name,
        parentName: data.parentName,
        parentPhone: encryptedPhone,
        kelasId: data.kelasId || null,
        userId: currentUser.userId,
      },
    });

    return {
      ...santri,
      parentPhone: data.parentPhone, // Return unencrypted for the immediate response
    };
  }

  private buildAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
    if (user.role === 'SUPERADMIN') return {};
    if (user.role === 'ADMIN' && user.orgId) {
      return {
        OR: [
          { userId: user.userId },
          { user: { organizationId: user.orgId } }
        ]
      };
    }
    return { userId: user.userId };
  }

  async getSantriList(user: { userId: string; role: string; orgId?: string | null }, page: number, limit: number, search?: string, kelasId?: string) {
    const skip = (page - 1) * limit;

    const accessWhere = this.buildAccessWhere(user);

    const where: any = {
      ...accessWhere,
      deletedAt: null, // BR-06: Soft delete
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
          kelas: {
            select: { id: true, name: true }
          }
        }
      }),
    ]);

    // Decrypt phones
    const decryptedSantris = santris.map((s: any) => {
      let phone = s.parentPhone;
      try {
        phone = decrypt(phone);
      } catch (e) {
        // Fallback if not encrypted or bad format
      }
      return { ...s, parentPhone: phone };
    });

    return {
      data: decryptedSantris,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSantriById(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);
    
    const santri = await prisma.santri.findFirst({
      where: {
        id,
        ...accessWhere,
        deletedAt: null,
      },
      include: {
        kelas: {
          select: { id: true, name: true }
        }
      }
    });

    if (!santri) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    let phone = santri.parentPhone;
    try {
      phone = decrypt(phone);
    } catch (e) {
      // Ignore
    }

    return { ...santri, parentPhone: phone };
  }

  async updateSantri(user: { userId: string; role: string; orgId?: string | null }, id: string, data: UpdateSantriInput) {
    const accessWhere = this.buildAccessWhere(user);

    const existing = await prisma.santri.findFirst({
      where: { id, ...accessWhere, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    const updateData: any = { ...data };
    
    if (data.parentPhone) {
      updateData.parentPhone = encrypt(data.parentPhone);
    }

    const updated = await prisma.santri.update({
      where: { id },
      data: updateData,
    });

    // Decrypt phone for response
    let phone = updated.parentPhone;
    try {
      phone = decrypt(phone);
    } catch (e) {
      // Ignore
    }

    return { ...updated, parentPhone: phone };
  }

  async softDeleteSantri(user: { userId: string; role: string; orgId?: string | null }, id: string) {
    const accessWhere = this.buildAccessWhere(user);

    const existing = await prisma.santri.findFirst({
      where: { id, ...accessWhere, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Santri tidak ditemukan', 404);
    }

    await prisma.santri.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Santri berhasil dihapus (soft delete)' };
  }
}
