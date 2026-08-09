import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { formatPaginationMeta, PaginationParams } from '../../utils/pagination';
import { AuditTrail } from '../audit/audit.model';
import { CreateUserInput, UpdateAvatarInput, UpdateProfileInput, UpdateUserInput } from './user.schema';

const BCRYPT_SALT_ROUNDS = 12;

interface CurrentUserContext {
  userId: string;
  role: string;
  orgId?: string | null;
}

export class UserService {
  async getUsers(currentUser: CurrentUserContext, params: PaginationParams, search?: string) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (currentUser.role === 'ADMIN') {
      if (!currentUser.orgId) {
        return { data: [], meta: formatPaginationMeta(0, page, limit) };
      }
      whereClause.organizationId = currentUser.orgId;
      whereClause.role = { not: 'SUPERADMIN' };
    } else if (currentUser.role !== 'SUPERADMIN') {
      whereClause.id = currentUser.userId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [total, users] = await prisma.$transaction([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
            organizationId: true,
            organization: { select: { id: true, name: true } },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        data: users,
        meta: formatPaginationMeta(total, page, limit),
      };
    } catch (err) {
      console.error('[UserService.getUsers] Database error:', err);
      throw new AppError('Gagal memuat data pengguna dari database', 500);
    }
  }

  async createUser(currentUser: CurrentUserContext, input: CreateUserInput, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    // Role access control (B-06)
    if (currentUser.role === 'ADMIN') {
      if (input.role !== 'USER') {
        throw new AppError('Admin hanya dapat mendaftarkan akun dengan role USER', 403);
      }
    }
    if (currentUser.role !== 'SUPERADMIN' && input.role === 'SUPERADMIN') {
      throw new AppError('Hanya Superadmin yang dapat membuat akun Superadmin', 403);
    }

    let organizationId = (input as any).organizationId || currentUser.orgId || null;
    let orgName = (input as any).organizationName?.trim();

    if (currentUser.role === 'SUPERADMIN' && orgName && !organizationId) {
      let existingOrg = await prisma.organization.findFirst({
        where: { name: orgName },
      });
      if (existingOrg) {
        organizationId = existingOrg.id;
      }
    }

    let activeUntil: Date | undefined = undefined;
    let isTrial = input.isTrial || false;

    if (isTrial && input.trialDays) {
      const now = new Date();
      now.setDate(now.getDate() + input.trialDays);
      activeUntil = now;
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        phone: input.phone,
        organizationId,
        isTrial,
        activeUntil,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (currentUser.role === 'SUPERADMIN' && orgName && !organizationId) {
      const newOrg = await prisma.organization.create({
        data: {
          name: orgName,
          adminId: user.id,
        }
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: newOrg.id }
      });
      user.organizationId = newOrg.id;
    }

    await AuditTrail.create({
      userId: currentUser.userId,
      userName: currentUser.userId,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return user;
  }

  async getUserById(currentUser: CurrentUserContext, id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        organizationId: true,
        organization: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    // RBAC check (BR-07, BR-08, B-05)
    if (currentUser.role === 'ADMIN') {
      if (user.organizationId !== currentUser.orgId) {
        throw new AppError('Akses ditolak: User tidak berada di organisasi Anda', 403);
      }
      if (user.role === 'SUPERADMIN') {
        throw new AppError('Akses ditolak: Admin tidak dapat melihat data Superadmin', 403);
      }
    }

    if (currentUser.role === 'USER' && user.id !== currentUser.userId) {
      throw new AppError('Akses ditolak', 403);
    }

    return user;
  }

  async updateUser(currentUser: CurrentUserContext, id: string, input: UpdateUserInput, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('User tidak ditemukan', 404);
    }

    if (currentUser.role === 'ADMIN') {
      if (existing.organizationId !== currentUser.orgId) {
        throw new AppError('Akses ditolak: User tidak berada di organisasi Anda', 403);
      }
      if (existing.role === 'SUPERADMIN') {
        throw new AppError('Akses ditolak: Admin tidak dapat mengubah data Superadmin', 403);
      }
      if (input.role && input.role !== 'USER') {
        throw new AppError('Admin hanya dapat mengaturnya sebagai role USER', 403);
      }
    }

    if (input.organizationName) {
      const orgName = input.organizationName.trim();
      if (orgName) {
        if (currentUser.role === 'ADMIN' && currentUser.orgId) {
          await prisma.organization.update({
            where: { id: currentUser.orgId },
            data: { name: orgName },
          });
        } else if (currentUser.role === 'SUPERADMIN' && !input.organizationId) {
          let existingOrg = await prisma.organization.findFirst({ where: { name: orgName } });
          if (existingOrg) {
            input.organizationId = existingOrg.id;
          } else {
            const isAlreadyAdmin = await prisma.organization.findUnique({ where: { adminId: id } });
            if (isAlreadyAdmin) {
              await prisma.organization.update({
                where: { id: isAlreadyAdmin.id },
                data: { name: orgName },
              });
              input.organizationId = isAlreadyAdmin.id;
            } else {
              const newOrg = await prisma.organization.create({
                data: { name: orgName, adminId: id }
              });
              input.organizationId = newOrg.id;
            }
          }
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.email && { email: input.email }),
        ...(input.role && { role: input.role }),
        ...(typeof input.isActive === 'boolean' && { isActive: input.isActive }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(currentUser.role === 'SUPERADMIN' && input.organizationId !== undefined && { organizationId: input.organizationId }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditTrail.create({
      userId: currentUser.userId,
      userName: currentUser.userId,
      action: 'UPDATE',
      entity: 'USER',
      entityId: id,
      oldData: { name: existing.name, role: existing.role, isActive: existing.isActive },
      newData: input,
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async updateProfile(userId: string, input: UpdateProfileInput, ipAddress?: string, userAgent?: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditTrail.create({
      userId,
      userName: updatedUser.name,
      action: 'UPDATE',
      entity: 'PROFILE',
      entityId: userId,
      newData: input,
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async updateAvatar(userId: string, input: UpdateAvatarInput, ipAddress?: string, userAgent?: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: input.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditTrail.create({
      userId,
      userName: updatedUser.name,
      action: 'UPDATE',
      entity: 'AVATAR',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  async deleteUser(currentUser: CurrentUserContext, id: string, ipAddress?: string, userAgent?: string) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('User tidak ditemukan', 404);
    }

    if (currentUser.role === 'ADMIN') {
      if (existing.organizationId !== currentUser.orgId) {
        throw new AppError('Akses ditolak: User tidak berada di organisasi Anda', 403);
      }
      if (existing.role === 'SUPERADMIN') {
        throw new AppError('Akses ditolak: Admin tidak dapat menghapus Superadmin', 403);
      }
    }

    if (existing.id === currentUser.userId) {
      throw new AppError('Anda tidak dapat menghapus akun Anda sendiri', 400);
    }

    await prisma.user.delete({ where: { id } });

    await AuditTrail.create({
      userId: currentUser.userId,
      userName: currentUser.userId,
      action: 'DELETE',
      entity: 'USER',
      entityId: id,
      ipAddress,
      userAgent,
    });

    return { id };
  }
}

export const userService = new UserService();

