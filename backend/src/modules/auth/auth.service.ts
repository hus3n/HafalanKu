import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/token';
import { AuditTrail } from '../audit/audit.model';
import { ChangePasswordInput, GoogleAuthInput, LoginInput, RegisterInput } from './auth.schema';
import { Role } from '@prisma/client';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { WhatsAppSession } from '../whatsapp/whatsapp.model';
import { getTelegramBot, getTelegramChatId } from '../../config/telegram';
import { emailService } from '../email/email.service';
import { env } from '../../config/env';

const BCRYPT_SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput, ipAddress?: string, userAgent?: string) {
    const emailNormalized = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      // Jika akun sudah terdaftar tapi belum verifikasi email, kirim ulang OTP
      if (!existingUser.isEmailVerified && !existingUser.googleId) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailOtp: otp,
            emailOtpExpires: otpExpires,
          },
        });

        emailService.sendOtpVerification(existingUser.email, existingUser.name, otp).catch((err) => {
          console.error('[AuthService] Error sending OTP:', err);
        });

        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
          },
          requiresEmailVerification: true,
          email: existingUser.email,
          message: 'Akun Anda sudah terdaftar namun belum diverifikasi. Kode OTP baru telah dikirim ke email Anda.',
        };
      }

      throw new AppError('Email sudah terdaftar. Silakan masuk menggunakan kata sandi Anda.', 400);
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

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          name: input.name,
          email: emailNormalized,
          passwordHash,
          role,
          phone: input.phone,
          activeUntil,
          isTrial,
          isActive: false, // User is pending activation by superadmin
          isEmailVerified: false, // Must verify OTP first
          emailOtp: otp,
          emailOtpExpires: otpExpires,
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

    // Kirim email OTP verifikasi secara asinkron
    emailService.sendOtpVerification(user.email, user.name, otp).catch((err) => {
      console.error('[AuthService] Error sending OTP email:', err);
    });

    const { passwordHash: _, emailOtp: __, emailOtpExpires: ___, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      requiresEmailVerification: true,
      email: user.email,
      message: 'Pendaftaran berhasil! Silakan masukkan 6 digit kode verifikasi yang telah kami kirimkan ke email Anda.',
    };
  }

  /**
   * Verifikasi kode OTP email
   */
  async verifyEmail(email: string, otp: string, ipAddress?: string, userAgent?: string) {
    const emailNormalized = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new AppError('Akun dengan email tersebut tidak ditemukan.', 404);
    }

    if (user.isEmailVerified) {
      return {
        message: 'Email Anda sudah terverifikasi sebelumnya.',
        isEmailVerified: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isActive: user.isActive,
        },
      };
    }

    if (!user.emailOtp || user.emailOtp !== otp.trim()) {
      throw new AppError('Kode verifikasi OTP tidak valid atau salah. Silakan periksa kembali.', 400);
    }

    if (user.emailOtpExpires && user.emailOtpExpires < new Date()) {
      throw new AppError('Kode verifikasi OTP telah kadaluarsa. Silakan klik kirim ulang kode baru.', 400);
    }

    // Update status email terverifikasi
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpires: null,
      },
      include: {
        organization: true,
      },
    });

    // Audit trail
    await AuditTrail.create({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE',
      entity: 'USER_VERIFY_EMAIL',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // Kirim notifikasi WhatsApp & Telegram ke Superadmin setelah email terverifikasi
    this.notifySuperadminNewRegistration({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '-',
      role: updatedUser.role,
      organizationName: updatedUser.organization?.name || 'Perorangan',
      createdAt: updatedUser.createdAt,
    }).catch((err) => {
      console.error('[AuthService] Error notifying superadmin of verified registration:', err);
    });

    const { passwordHash: _, emailOtp: __, emailOtpExpires: ___, ...userWithoutSensitive } = updatedUser;

    return {
      message: 'Email Anda berhasil diverifikasi! Akun sedang menunggu aktivasi oleh Superadmin.',
      isEmailVerified: true,
      user: userWithoutSensitive,
    };
  }

  /**
   * Kirim ulang kode OTP verifikasi email
   */
  async resendOtp(email: string) {
    const emailNormalized = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new AppError('Akun dengan email tersebut tidak ditemukan.', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email Anda sudah terverifikasi sebelumnya. Anda dapat langsung masuk.', 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpires: otpExpires,
      },
    });

    await emailService.sendOtpVerification(user.email, user.name, otp);

    return {
      message: 'Kode verifikasi OTP baru telah berhasil dikirim ke email Anda.',
    };
  }

  /**
   * Autentikasi Google Sign-In (One-Tap / OAuth)
   */
  async googleAuth(input: GoogleAuthInput, ipAddress?: string, userAgent?: string) {
    let payload: { sub: string; email: string; name?: string; picture?: string };

    try {
      // Verifikasi token via Google TokenInfo API resmi
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(input.credential)}`);
      if (response.ok) {
        const data: any = await response.json();
        payload = {
          sub: data.sub,
          email: data.email?.toLowerCase(),
          name: data.name,
          picture: data.picture,
        };
      } else {
        // Coba alternatif via access_token jika token berjenis access_token
        const altResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(input.credential)}`);
        if (altResponse.ok) {
          const altData: any = await altResponse.json();
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${input.credential}` },
          });
          const userinfo: any = userinfoRes.ok ? await userinfoRes.json() : {};
          payload = {
            sub: altData.user_id || userinfo.sub,
            email: (altData.email || userinfo.email)?.toLowerCase(),
            name: userinfo.name || userinfo.given_name,
            picture: userinfo.picture,
          };
        } else {
          throw new Error('Google token verification failed');
        }
      }
    } catch (err: any) {
      console.error('[Google Auth Verification Error]', err);
      throw new AppError('Verifikasi akun Google gagal. Pastikan token Google valid.', 401);
    }

    if (!payload.email) {
      throw new AppError('Gagal mendapatkan alamat email dari akun Google Anda.', 400);
    }

    // Cari user berdasarkan email atau googleId
    let user: any = await prisma.user.findFirst({
      where: {
        OR: [
          { email: payload.email },
          { googleId: payload.sub },
        ],
      },
      include: {
        organization: {
          include: { admin: true },
        },
      },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      let role: Role = Role.USER;
      if (input.accountType === 'organization') {
        role = Role.ADMIN;
      }

      const randomPassword = `Ggl_${Math.random().toString(36).slice(-10)}_${Date.now()}`;
      const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_SALT_ROUNDS);

      const now = new Date();
      now.setDate(now.getDate() + 14); // 14 days trial

      user = await prisma.$transaction(async (tx: any) => {
        const newUser = await tx.user.create({
          data: {
            name: payload.name || payload.email.split('@')[0],
            email: payload.email,
            passwordHash,
            role,
            phone: input.phone || null,
            avatarUrl: payload.picture || null,
            googleId: payload.sub,
            isEmailVerified: true, // Google accounts are pre-verified
            isActive: false, // Pending Superadmin approval
            isTrial: true,
            activeUntil: now,
          },
        });

        if (input.accountType === 'organization' && input.organizationName) {
          const org = await tx.organization.create({
            data: {
              name: input.organizationName,
              adminId: newUser.id,
            },
          });

          return tx.user.update({
            where: { id: newUser.id },
            data: { organizationId: org.id },
            include: { organization: { include: { admin: true } } },
          });
        }

        return newUser;
      });

      // Audit Trail
      await AuditTrail.create({
        userId: user.id,
        userName: user.name,
        action: 'CREATE',
        entity: 'USER_GOOGLE',
        entityId: user.id,
        ipAddress,
        userAgent,
      });

      // Notifikasi ke Superadmin
      this.notifySuperadminNewRegistration({
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        role: user.role,
        organizationName: input.organizationName || 'Perorangan',
        createdAt: user.createdAt,
      }).catch((err) => {
        console.error('[AuthService] Error notifying superadmin of Google registration:', err);
      });
    } else {
      // User sudah ada, pastikan googleId dan isEmailVerified terupdate
      if (!user.googleId || !user.isEmailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            isEmailVerified: true,
            avatarUrl: user.avatarUrl || payload.picture,
          },
          include: {
            organization: {
              include: { admin: true },
            },
          },
        });
      }
    }

    if (!user) {
      throw new AppError('Gagal memproses akun Google pengguna.', 500);
    }

    if (!user.isActive) {
      throw new AppError('Akun Google Anda berhasil terdaftar dan sedang menunggu persetujuan / aktivasi oleh Superadmin.', 403);
    }

    // Checking active period
    if (user.role === 'USER' && user.organizationId && user.organization?.admin) {
      const orgAdmin = user.organization.admin;
      if (orgAdmin.activeUntil && new Date(orgAdmin.activeUntil) < new Date()) {
        throw new AppError('Masa aktif organisasi/lembaga Anda telah berakhir. Silakan hubungi Superadmin.', 403);
      }
    } else if (user.activeUntil && new Date(user.activeUntil) < new Date()) {
      throw new AppError('Masa aktif akun Anda telah berakhir. Silakan hubungi Superadmin.', 403);
    }

    // Log Audit
    await AuditTrail.create({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN_GOOGLE',
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

    const { passwordHash: _, emailOtp: __, emailOtpExpires: ___, ...userWithoutPassword } = user as any;

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
      isNewUser,
    };
  }

  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: input.email.trim().toLowerCase() },
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

    // Verifikasi status verifikasi email
    if (!user.isEmailVerified && !user.googleId) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtp: otp,
          emailOtpExpires: otpExpires,
        },
      });

      emailService.sendOtpVerification(user.email, user.name, otp).catch(() => {});

      throw new AppError(
        'Email Anda belum diverifikasi. Kode OTP baru telah dikirim ke email Anda. Silakan verifikasi terlebih dahulu.',
        403
      );
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

    const { passwordHash: _, emailOtp: __, emailOtpExpires: ___, ...userWithoutPassword } = user;

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

    const { passwordHash: _, emailOtp: __, emailOtpExpires: ___, ...userWithoutPassword } = user;
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
    
    // 1. Kirim via WhatsApp ke Superadmin
    try {
      const waMessage = 
        `📢 *NOTIFIKASI PENDAFTARAN BARU HAFALANKU*\n\n` +
        `Ada pengguna baru yang baru saja mendaftar dan menyelesaikan verifikasi email:\n\n` +
        `👤 *Nama:* ${data.name}\n` +
        `📧 *Email:* ${data.email}\n` +
        `📱 *WhatsApp:* ${data.phone}\n` +
        `🔑 *Role:* ${data.role}\n` +
        `🏢 *Lembaga/TPQ:* ${data.organizationName || 'Perorangan'}\n` +
        `🕒 *Waktu Daftar:* ${timeStr} WIB\n\n` +
        `Silakan login ke *Dashboard Superadmin* (Menu Pengguna Platform) untuk mengaktifkan akun pengguna tersebut.\n\n` +
        `_Pesan otomatis dikirim oleh Sistem HafalanKu._`;

      const activeSession = await WhatsAppSession.findOne({ status: 'CONNECTED' });
      const senderId = activeSession?.userId;
      const superAdminPhone = env.SUPERADMIN_PHONE || '085229925593';
      
      if (senderId && superAdminPhone) {
        const whatsappService = new WhatsAppService();
        await whatsappService.sendMessage(senderId, superAdminPhone, waMessage);
      }
    } catch (waErr: any) {
      console.warn('[AuthService] WhatsApp notification to Superadmin skipped/failed:', waErr?.message || waErr);
    }

    // 2. Kirim via Telegram Bot ke Superadmin
    try {
      const bot = getTelegramBot();
      const chatId = getTelegramChatId();
      if (bot && chatId) {
        const tgMessage =
          `📢 *PENDAFTARAN PENGGUNA BARU (TERVERIFIKASI)*\n\n` +
          `Pengguna baru telah mendaftar & memverifikasi email:\n\n` +
          `👤 *Nama:* \`${data.name}\`\n` +
          `📧 *Email:* \`${data.email}\`\n` +
          `📱 *No. HP:* \`${data.phone}\`\n` +
          `🔑 *Role:* \`${data.role}\`\n` +
          `🏢 *Lembaga:* ${data.organizationName || 'Perorangan'}\n` +
          `🕒 *Waktu:* ${timeStr} WIB\n\n` +
          `_Buka menu Superadmin untuk mengaktifkan akun ini._`;

        await bot.sendMessage(chatId, tgMessage, { parse_mode: 'Markdown' });
      }
    } catch (tgErr: any) {
      console.warn('[AuthService] Telegram notification to Superadmin skipped/failed:', tgErr?.message || tgErr);
    }
  }
}

export const authService = new AuthService();
