import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/token';
import { AuditTrail } from '../audit/audit.model';
import { ChangePasswordInput, LoginInput, RegisterInput } from './auth.schema';
import { Role } from '@prisma/client';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { getTelegramBot, getTelegramChatId } from '../../config/telegram';

const BCRYPT_SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    let role: Role = Role.USER;
    if (input.accountType === 'organization') {
      role = Role.ADMIN;
    }

    let activeUntil: Date | null = null;
    let isTrial = false;

    const period = (input as any).trialPeriod || '14_DAYS';
    const now = new Date();
    if (period === '7_DAYS') {
      now.setDate(now.getDate() + 7);
      activeUntil = now;
      isTrial = true;
    } else if (period === '14_DAYS') {
      now.setDate(now.getDate() + 14);
      activeUntil = now;
      isTrial = true;
    } else if (period === '30_DAYS') {
      now.setDate(now.getDate() + 30);
      activeUntil = now;
      isTrial = true;
    } else if (period === '1_MONTH') {
      now.setMonth(now.getMonth() + 1);
      activeUntil = now;
      isTrial = false;
    } else if (period === '1_YEAR') {
      now.setFullYear(now.getFullYear() + 1);
      activeUntil = now;
      isTrial = false;
    }

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role,
          phone: input.phone,
          activeUntil,
          isTrial,
          isActive: false, // User is pending activation by admin
        },
      });

      if (input.accountType === 'organization' && input.organizationName) {
        const org = await tx.organization.create({
          data: {
            name: input.organizationName,
            adminId: newUser.id,
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { organizationId: org.id },
          include: { organization: true },
        });

        return updatedUser;
      }

      return newUser;
    });

    // Save initial password in history
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash,
      },
    });

    // Audit trail
    await AuditTrail.create({
      userId: user.id,
      userName: user.name,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    // Kirim notifikasi WhatsApp & Telegram otomatis ke Superadmin secara asinkron
    this.notifySuperadminNewRegistration({
      name: user.name,
      email: user.email,
      phone: input.phone || '-',
      role: user.role,
      organizationName: input.organizationName || 'Perorangan',
      createdAt: user.createdAt,
    }).catch((err) => {
      console.error('[AuthService] Error notifying superadmin of new registration:', err);
    });

    // Do not return tokens; user needs to be activated by superadmin first
    return {
      user: userWithoutPassword,
      message: 'Akun berhasil didaftarkan dan sedang menunggu persetujuan Admin.',
    };
  }

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: input.email },
        include: { 
          organization: {
            include: { admin: true }
          } 
        },
      });
    } catch (err) {
      console.warn('DB lookup fallback:', err);
    }

    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    if (!user.isActive) {
      throw new AppError('Akun Anda sedang diverifikasi / belum diaktifkan oleh Superadmin.', 403);
    }

    // Checking active period:
    // If user is part of an organization and role is USER, active period follows the Organization Admin
    if (user.role === 'USER' && user.organizationId && user.organization?.admin) {
      const orgAdmin = user.organization.admin;
      if (orgAdmin.activeUntil && new Date(orgAdmin.activeUntil) < new Date()) {
        throw new AppError('Masa aktif organisasi/lembaga Anda telah berakhir (Kadaluarsa). Silakan hubungi Superadmin.', 403);
      }
    } else if (user.activeUntil && new Date(user.activeUntil) < new Date()) {
      throw new AppError('Masa aktif akun Anda telah berakhir (Kadaluarsa). Silakan hubungi Superadmin.', 403);
    }

    // Check account lockout (BR-03: 5x failed = 15 mins lock)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      throw new AppError(
        `Akun terkunci karena 5 kali percobaan login gagal. Silakan coba lagi dalam ${remainingMinutes} menit.`,
        429
      );
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);

    if (!isMatch) {
      const attempts = user.loginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil,
        },
      });

      if (attempts >= 5) {
        throw new AppError(
          'Akun Anda terkunci selama 15 menit karena 5 kali percobaan login yang gagal.',
          429
        );
      }

      throw new AppError('Email atau password salah', 401);
    }

    // Reset login attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Log Audit
    await AuditTrail.create({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
    };

    const token = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  async refreshToken(refreshTokenStr: string) {
    const decoded = verifyToken<{ userId: string }>(refreshTokenStr);
    
    if (!decoded.userId) {
      throw new AppError('Refresh token tidak valid', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('User tidak ditemukan atau tidak aktif', 401);
    }

    const tokenPayload = {
      userId: user.id,
      role: user.role,
      orgId: user.organizationId,
    };

    const token = generateAccessToken(tokenPayload);
    return { token };
  }

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User tidak ditemukan', 404);
    }

    const isOldMatch = await bcrypt.compare(input.oldPassword, user.passwordHash);
    if (!isOldMatch) {
      throw new AppError('Password lama tidak sesuai', 400);
    }

    // BR-02: Check new password against last 3 password history entries
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    for (const entry of history) {
      const isHistoricalMatch = await bcrypt.compare(input.newPassword, entry.passwordHash);
      if (isHistoricalMatch) {
        throw new AppError('Password baru tidak boleh sama dengan 3 password terakhir yang pernah digunakan', 400);
      }
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: newPasswordHash,
        },
      }),
    ]);

    await AuditTrail.create({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE',
      entity: 'USER_PASSWORD',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return { message: 'Password berhasil diubah' };
  }

  async getMe(userId: string) {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true,
        },
      });
    } catch (err) {
      console.warn('DB getMe fallback:', err);
    }

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Mengirimkan notifikasi pendaftaran pengguna baru ke WhatsApp dan Telegram Superadmin
   */
  private async notifySuperadminNewRegistration(data: {
    name: string;
    email: string;
    phone: string;
    role: string;
    organizationName?: string;
    createdAt: Date;
  }) {
    const timeStr = new Date(data.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const superAdminPhone = process.env.SUPERADMIN_PHONE || '085229925593';

    // Format pesan WhatsApp
    const waMessage =
      `🔔 *Pemberitahuan Pendaftaran Pengguna Baru - HafalanKu*\n\n` +
      `Assalamu'alaikum Superadmin,\n` +
      `Ada pengguna baru yang baru saja mendaftar dan menunggu persetujuan / aktivasi akun:\n\n` +
      `👤 *Nama:* ${data.name}\n` +
      `📧 *Email:* ${data.email}\n` +
      `📱 *No. HP/WA:* ${data.phone}\n` +
      `🏷️ *Role:* ${data.role}\n` +
      `🏢 *Lembaga/TPQ:* ${data.organizationName || 'Perorangan'}\n` +
      `🕒 *Waktu Daftar:* ${timeStr} WIB\n\n` +
      `Silakan login ke *Dashboard Superadmin* (Menu Pengguna Platform) untuk mengaktifkan akun pengguna tersebut.\n\n` +
      `- *Sistem Otomatis HafalanKu*`;

    // 1. Kirim via WhatsApp Gateway
    try {
      const superAdminUser = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' },
      });
      const senderId = superAdminUser?.id || 'SYSTEM';

      const whatsappService = new WhatsAppService();
      await whatsappService.sendMessage(senderId, superAdminPhone, waMessage);
      console.log(`[AuthService] WhatsApp notification sent to Superadmin (${superAdminPhone}) for new user ${data.email}`);
    } catch (waErr: any) {
      console.warn('[AuthService] WhatsApp notification to Superadmin skipped/failed:', waErr?.message || waErr);
    }

    // 2. Kirim via Telegram Bot (jika sudah dikonfigurasi)
    try {
      const bot = getTelegramBot();
      const chatId = getTelegramChatId();
      if (bot && chatId) {
        const tgMessage =
          `🔔 *Pemberitahuan Pendaftaran Pengguna Baru - HafalanKu*\n\n` +
          `Pengguna baru baru saja mendaftar dan menunggu aktivasi:\n\n` +
          `👤 *Nama:* \`${data.name}\`\n` +
          `📧 *Email:* \`${data.email}\`\n` +
          `📱 *No. HP:* \`${data.phone}\`\n` +
          `🏷️ *Role:* *${data.role}*\n` +
          `🏢 *Lembaga:* ${data.organizationName || 'Perorangan'}\n` +
          `🕒 *Waktu:* ${timeStr} WIB\n\n` +
          `_Buka menu Superadmin untuk mengaktifkan akun ini._`;

        await bot.sendMessage(chatId, tgMessage, { parse_mode: 'Markdown' });
        console.log(`[AuthService] Telegram notification sent to Superadmin for new user ${data.email}`);
      }
    } catch (tgErr: any) {
      console.warn('[AuthService] Telegram notification to Superadmin skipped/failed:', tgErr?.message || tgErr);
    }
  }
}

export const authService = new AuthService();
