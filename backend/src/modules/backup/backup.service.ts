import crypto from 'crypto';
import { prisma } from '../../config/database';
import { BackupLog } from './backup.model';
import { encrypt, decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';
import { getTelegramBot, getTelegramChatId } from '../../config/telegram';
import { WhatsAppSession, WhatsAppAuthKey } from '../whatsapp/whatsapp.model';
import { DashboardService } from '../dashboard/dashboard.service';

export type BackupContext = string | {
  userId: string;
  role?: string;
  orgId?: string | null;
};

export class BackupService {
  private calculateSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async createBackup(userOrContext: BackupContext) {
    let userId = typeof userOrContext === 'string' ? userOrContext : userOrContext.userId;
    let role = typeof userOrContext === 'object' ? userOrContext.role : undefined;
    let orgId = typeof userOrContext === 'object' ? userOrContext.orgId : undefined;

    const isSystemBackup = userId === 'system-auto-backup' || role === 'SUPERADMIN';

    let dbUser: { role: string; organizationId: string | null } | null = null;
    if (!isSystemBackup && !role) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, organizationId: true },
      });
      if (dbUser) {
        role = dbUser.role;
        if (!orgId) orgId = dbUser.organizationId;
      }
    }

    let scope: 'SYSTEM' | 'ORGANIZATION' | 'USER' = 'USER';
    let users: any[] = [];
    let organizations: any[] = [];
    let passwordHistories: any[] = [];
    let santris: any[] = [];
    let kelases: any[] = [];
    let hafalans: any[] = [];
    let murajaahs: any[] = [];
    let murajaahHistories: any[] = [];
    let absensis: any[] = [];
    let reviews: any[] = [];
    let whatsAppSessions: any[] = [];
    let whatsAppAuthKeys: any[] = [];

    if (isSystemBackup || role === 'SUPERADMIN') {
      scope = 'SYSTEM';
      const [
        allUsers,
        allOrgs,
        allPwHistories,
        allSantris,
        allKelases,
        allHafalans,
        allMurajaahs,
        allMurajaahHistories,
        allAbsensis,
        allReviews,
        allSessions,
        allAuthKeys,
      ] = await Promise.all([
        prisma.user.findMany(),
        prisma.organization.findMany(),
        prisma.passwordHistory.findMany(),
        prisma.santri.findMany(),
        prisma.kelas.findMany(),
        prisma.hafalan.findMany(),
        prisma.murajaahSchedule.findMany(),
        prisma.murajaahHistory.findMany(),
        prisma.absensi.findMany(),
        prisma.review.findMany(),
        WhatsAppSession.find({}).lean(),
        WhatsAppAuthKey.find({}).lean(),
      ]);

      users = allUsers;
      organizations = allOrgs;
      passwordHistories = allPwHistories;
      santris = allSantris;
      kelases = allKelases;
      hafalans = allHafalans;
      murajaahs = allMurajaahs;
      murajaahHistories = allMurajaahHistories;
      absensis = allAbsensis;
      reviews = allReviews;
      whatsAppSessions = allSessions;
      whatsAppAuthKeys = allAuthKeys;
    } else if (role === 'ADMIN') {
      scope = 'ORGANIZATION';

      let organization = null;
      if (orgId) {
        organization = await prisma.organization.findUnique({ where: { id: orgId } });
      }
      if (!organization) {
        organization = await prisma.organization.findUnique({ where: { adminId: userId } });
      }
      if (!organization && dbUser?.organizationId) {
        organization = await prisma.organization.findUnique({ where: { id: dbUser.organizationId } });
      }

      let targetUserIds: string[] = [userId];

      if (organization) {
        organizations = [organization];
        const orgUsers = await prisma.user.findMany({
          where: {
            OR: [
              { organizationId: organization.id },
              { id: organization.adminId },
              { id: userId },
            ],
          },
        });
        users = orgUsers;
        targetUserIds = Array.from(new Set(orgUsers.map((u) => u.id)));
      } else {
        const selfUser = await prisma.user.findUnique({ where: { id: userId } });
        if (selfUser) users = [selfUser];
      }

      const [
        orgPwHistories,
        orgSantris,
        orgKelases,
        orgHafalans,
        orgMurajaahs,
        orgMurajaahHistories,
        orgAbsensis,
        orgReviews,
        orgSessions,
        orgAuthKeys,
      ] = await Promise.all([
        prisma.passwordHistory.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.santri.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.kelas.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.hafalan.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.murajaahSchedule.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.murajaahHistory.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.absensi.findMany({ where: { userId: { in: targetUserIds } } }),
        prisma.review.findMany({ where: { userId: { in: targetUserIds } } }),
        WhatsAppSession.find({ userId: { $in: targetUserIds } }).lean(),
        WhatsAppAuthKey.find({ userId: { $in: targetUserIds } }).lean(),
      ]);

      passwordHistories = orgPwHistories;
      santris = orgSantris;
      kelases = orgKelases;
      hafalans = orgHafalans;
      murajaahs = orgMurajaahs;
      murajaahHistories = orgMurajaahHistories;
      absensis = orgAbsensis;
      reviews = orgReviews;
      whatsAppSessions = orgSessions;
      whatsAppAuthKeys = orgAuthKeys;
    } else {
      // Single USER scope
      scope = 'USER';
      const selfUser = await prisma.user.findUnique({ where: { id: userId } });
      if (selfUser) users = [selfUser];

      const [
        userSantris,
        userKelases,
        userHafalans,
        userMurajaahs,
        userMurajaahHistories,
        userAbsensis,
        userReviews,
        userSessions,
        userAuthKeys,
      ] = await Promise.all([
        prisma.santri.findMany({ where: { userId } }),
        prisma.kelas.findMany({ where: { userId } }),
        prisma.hafalan.findMany({ where: { userId } }),
        prisma.murajaahSchedule.findMany({ where: { userId } }),
        prisma.murajaahHistory.findMany({ where: { userId } }),
        prisma.absensi.findMany({ where: { userId } }),
        prisma.review.findMany({ where: { userId } }),
        WhatsAppSession.find({ userId }).lean(),
        WhatsAppAuthKey.find({ userId }).lean(),
      ]);

      santris = userSantris;
      kelases = userKelases;
      hafalans = userHafalans;
      murajaahs = userMurajaahs;
      murajaahHistories = userMurajaahHistories;
      absensis = userAbsensis;
      reviews = userReviews;
      whatsAppSessions = userSessions;
      whatsAppAuthKeys = userAuthKeys;
    }

    const backupPayload = {
      app: 'HafalanKu',
      version: '2.0',
      scope,
      timestamp: new Date().toISOString(),
      userId,
      data: {
        users,
        organizations,
        passwordHistories,
        santris,
        kelases,
        hafalans,
        murajaahs,
        murajaahHistories,
        absensis,
        reviews,
        whatsAppSessions,
        whatsAppAuthKeys,
      },
    };

    const payloadJson = JSON.stringify(backupPayload);
    const checksum = this.calculateSha256(payloadJson);
    const encryptedData = encrypt(payloadJson);
    const filename = `backup_hafalanku_${scope.toLowerCase()}_${Date.now()}.hfk`;
    const sizeBytes = Buffer.byteLength(encryptedData, 'utf8');

    const bot = getTelegramBot();
    const chatId = getTelegramChatId();
    let telegramSent = false;

    // Standardized file content envelope (.hfk)
    const filePayload = JSON.stringify({
      app: 'HafalanKu',
      version: '2.0',
      scope,
      filename,
      checksum,
      sizeBytes,
      createdAt: new Date().toISOString(),
      encryptedData,
    }, null, 2);

    if (bot && chatId) {
      try {
        const buffer = Buffer.from(filePayload, 'utf-8');
        await bot.sendDocument(chatId, buffer, {
          caption: `📦 Backup HafalanKu [${scope}]\n📅 ${new Date().toLocaleString('id-ID')}\n📁 ${filename}\n🔒 Checksum: ${checksum.substring(0, 16)}...`,
        }, { filename, contentType: 'application/octet-stream' });
        telegramSent = true;
      } catch (err) {
        console.error('[Telegram] Failed to send backup:', err);
      }
    }

    // Log Backup in MongoDB
    const log = await BackupLog.create({
      userId,
      filename,
      checksum,
      sizeBytes,
      status: 'SUCCESS',
      telegramSent,
    });

    return {
      backupId: log._id,
      filename,
      checksum,
      sizeBytes,
      encryptedData,
      createdAt: log.createdAt,
    };
  }

  async restoreBackup(userOrContext: BackupContext, encryptedData: string, providedChecksum?: string) {
    const targetUserId = typeof userOrContext === 'string' ? userOrContext : userOrContext.userId;

    // 1. Auto-backup current state first (Safety Criterion)
    try {
      await this.createBackup(userOrContext);
    } catch (err) {
      console.warn('[Restore] Safety auto-backup warning:', err);
    }

    // 2. Clean encrypted data (strip whitespace / newlines)
    const cleanEncryptedData = (encryptedData || '').trim();

    // 3. Decrypt Payload
    let decryptedJson: string;
    try {
      decryptedJson = decrypt(cleanEncryptedData);
    } catch (err) {
      throw new AppError('File backup tidak valid atau gagal didekripsi (AES-256 error)', 400);
    }

    // 4. Verify SHA-256 Checksum Integrity if provided
    const computedChecksum = this.calculateSha256(decryptedJson);
    if (providedChecksum && providedChecksum.trim() && computedChecksum.toLowerCase() !== providedChecksum.trim().toLowerCase()) {
      throw new AppError('Integritas file backup rusak (SHA-256 Checksum mismatch)', 400);
    }

    let payload: any;
    try {
      payload = JSON.parse(decryptedJson);
    } catch (err) {
      throw new AppError('Format JSON internal berkas backup rusak', 400);
    }

    if (!payload || !payload.data) {
      throw new AppError('Format struktur file backup tidak sesuai (data tidak ditemukan)', 400);
    }

    const isV2Comprehensive =
      (payload.data.users && Array.isArray(payload.data.users) && payload.data.users.length > 0) ||
      (payload.data.organizations && Array.isArray(payload.data.organizations) && payload.data.organizations.length > 0) ||
      payload.version === '2.0';

    let totalRestored = {
      users: 0,
      organizations: 0,
      santri: 0,
      kelas: 0,
      hafalan: 0,
      murajaah: 0,
      absensi: 0,
      reviews: 0,
      whatsappSessions: 0,
    };

    if (isV2Comprehensive) {
      const {
        users = [],
        organizations = [],
        passwordHistories = [],
        santris = [],
        kelases = [],
        hafalans = [],
        murajaahs = [],
        murajaahHistories = [],
        absensis = [],
        reviews = [],
        whatsAppSessions = [],
        whatsAppAuthKeys = [],
      } = payload.data;

      await prisma.$transaction(async (tx: any) => {
        // 1. Upsert Users (temporarily nullify organizationId to prevent FK deadlock)
        if (users && users.length > 0) {
          for (const u of users) {
            await tx.user.upsert({
              where: { id: u.id },
              create: {
                id: u.id,
                email: u.email,
                name: u.name,
                passwordHash: u.passwordHash,
                role: u.role || 'USER',
                phone: u.phone ?? null,
                avatarUrl: u.avatarUrl ?? null,
                isActive: u.isActive !== undefined ? u.isActive : true,
                isEmailVerified: u.isEmailVerified !== undefined ? u.isEmailVerified : true,
                organizationId: null,
                activeUntil: u.activeUntil ? new Date(u.activeUntil) : null,
                isTrial: u.isTrial ?? false,
                loginAttempts: u.loginAttempts ?? 0,
                lockedUntil: u.lockedUntil ? new Date(u.lockedUntil) : null,
                emailOtp: u.emailOtp ?? null,
                emailOtpExpires: u.emailOtpExpires ? new Date(u.emailOtpExpires) : null,
                googleId: u.googleId ?? null,
                createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
              },
              update: {
                email: u.email,
                name: u.name,
                passwordHash: u.passwordHash,
                role: u.role || 'USER',
                phone: u.phone ?? null,
                avatarUrl: u.avatarUrl ?? null,
                isActive: u.isActive !== undefined ? u.isActive : true,
                isEmailVerified: u.isEmailVerified !== undefined ? u.isEmailVerified : true,
                activeUntil: u.activeUntil ? new Date(u.activeUntil) : null,
                isTrial: u.isTrial ?? false,
                googleId: u.googleId ?? null,
              },
            });
          }
        }

        // 2. Upsert Organizations
        if (organizations && organizations.length > 0) {
          for (const org of organizations) {
            await tx.organization.upsert({
              where: { id: org.id },
              create: {
                id: org.id,
                name: org.name,
                adminId: org.adminId,
                createdAt: org.createdAt ? new Date(org.createdAt) : undefined,
              },
              update: {
                name: org.name,
                adminId: org.adminId,
              },
            });
          }
        }

        // 3. Update User organizationId now that organizations exist
        if (users && users.length > 0) {
          for (const u of users) {
            if (u.organizationId) {
              await tx.user.update({
                where: { id: u.id },
                data: { organizationId: u.organizationId },
              }).catch(() => {});
            }
          }
        }

        // 4. Upsert Password History
        if (passwordHistories && passwordHistories.length > 0) {
          for (const ph of passwordHistories) {
            if (ph.id) {
              await tx.passwordHistory.upsert({
                where: { id: ph.id },
                create: {
                  id: ph.id,
                  userId: ph.userId,
                  passwordHash: ph.passwordHash,
                  createdAt: ph.createdAt ? new Date(ph.createdAt) : undefined,
                },
                update: {
                  passwordHash: ph.passwordHash,
                },
              });
            }
          }
        }

        // 5. Upsert Kelases
        if (kelases && kelases.length > 0) {
          for (const k of kelases) {
            await tx.kelas.upsert({
              where: { id: k.id },
              create: {
                id: k.id,
                name: k.name,
                description: k.description ?? null,
                userId: k.userId,
                createdAt: k.createdAt ? new Date(k.createdAt) : undefined,
              },
              update: {
                name: k.name,
                description: k.description ?? null,
                userId: k.userId,
              },
            });
          }
        }

        // 6. Upsert Santris
        if (santris && santris.length > 0) {
          for (const s of santris) {
            await tx.santri.upsert({
              where: { id: s.id },
              create: {
                id: s.id,
                name: s.name,
                parentName: s.parentName,
                parentPhone: s.parentPhone,
                kelasId: s.kelasId ?? null,
                isActive: s.isActive !== undefined ? s.isActive : true,
                userId: s.userId,
                createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
                deletedAt: s.deletedAt ? new Date(s.deletedAt) : null,
              },
              update: {
                name: s.name,
                parentName: s.parentName,
                parentPhone: s.parentPhone,
                kelasId: s.kelasId ?? null,
                isActive: s.isActive !== undefined ? s.isActive : true,
                userId: s.userId,
                deletedAt: s.deletedAt ? new Date(s.deletedAt) : null,
              },
            });
          }
        }

        // 7. Upsert Hafalans
        if (hafalans && hafalans.length > 0) {
          for (const h of hafalans) {
            await tx.hafalan.upsert({
              where: { id: h.id },
              create: {
                id: h.id,
                santriId: h.santriId,
                surahNumber: h.surahNumber,
                surahName: h.surahName,
                ayatStart: h.ayatStart,
                ayatEnd: h.ayatEnd,
                predikat: h.predikat,
                type: h.type || 'ZIYADAH',
                isHafalanAwal: h.isHafalanAwal ?? false,
                date: new Date(h.date),
                notes: h.notes ?? null,
                userId: h.userId,
                createdAt: h.createdAt ? new Date(h.createdAt) : undefined,
              },
              update: {
                santriId: h.santriId,
                surahNumber: h.surahNumber,
                surahName: h.surahName,
                ayatStart: h.ayatStart,
                ayatEnd: h.ayatEnd,
                predikat: h.predikat,
                type: h.type || 'ZIYADAH',
                isHafalanAwal: h.isHafalanAwal ?? false,
                date: new Date(h.date),
                notes: h.notes ?? null,
                userId: h.userId,
              },
            });
          }
        }

        // 8. Upsert Murajaah Schedules
        if (murajaahs && murajaahs.length > 0) {
          for (const m of murajaahs) {
            await tx.murajaahSchedule.upsert({
              where: { id: m.id },
              create: {
                id: m.id,
                santriId: m.santriId,
                surahNumber: m.surahNumber,
                surahName: m.surahName,
                ayatRange: m.ayatRange || null,
                isSelected: m.isSelected !== undefined ? m.isSelected : true,
                lastReviewDate: m.lastReviewDate ? new Date(m.lastReviewDate) : null,
                priorityScore: m.priorityScore ?? 0,
                userId: m.userId,
                createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
              },
              update: {
                santriId: m.santriId,
                surahNumber: m.surahNumber,
                surahName: m.surahName,
                ayatRange: m.ayatRange || null,
                isSelected: m.isSelected !== undefined ? m.isSelected : true,
                lastReviewDate: m.lastReviewDate ? new Date(m.lastReviewDate) : null,
                priorityScore: m.priorityScore ?? 0,
                userId: m.userId,
              },
            });
          }
        }

        // 9. Upsert Murajaah History
        if (murajaahHistories && murajaahHistories.length > 0) {
          for (const mh of murajaahHistories) {
            await tx.murajaahHistory.upsert({
              where: { id: mh.id },
              create: {
                id: mh.id,
                santriId: mh.santriId,
                surahNumber: mh.surahNumber,
                surahName: mh.surahName,
                ayatRange: mh.ayatRange || null,
                status: mh.status || 'BELUM',
                date: mh.date ? new Date(mh.date) : new Date(),
                userId: mh.userId,
                createdAt: mh.createdAt ? new Date(mh.createdAt) : undefined,
              },
              update: {
                santriId: mh.santriId,
                surahNumber: mh.surahNumber,
                surahName: mh.surahName,
                ayatRange: mh.ayatRange || null,
                status: mh.status || 'BELUM',
                date: mh.date ? new Date(mh.date) : new Date(),
                userId: mh.userId,
              },
            });
          }
        }

        // 10. Upsert Absensi
        if (absensis && absensis.length > 0) {
          for (const a of absensis) {
            const absensiDate = new Date(a.date);
            await tx.absensi.upsert({
              where: { id: a.id },
              create: {
                id: a.id,
                santriId: a.santriId,
                date: absensiDate,
                status: a.status,
                notes: a.notes ?? null,
                userId: a.userId,
                createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
              },
              update: {
                santriId: a.santriId,
                date: absensiDate,
                status: a.status,
                notes: a.notes ?? null,
                userId: a.userId,
              },
            });
          }
        }

        // 11. Upsert Reviews
        if (reviews && reviews.length > 0) {
          for (const r of reviews) {
            await tx.review.upsert({
              where: { id: r.id },
              create: {
                id: r.id,
                name: r.name,
                roleOrTitle: r.roleOrTitle ?? null,
                rating: r.rating ?? 5,
                comment: r.comment,
                imageUrl: r.imageUrl ?? null,
                userAvatarUrl: r.userAvatarUrl ?? null,
                userId: r.userId ?? null,
                isApproved: r.isApproved !== undefined ? r.isApproved : true,
                createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
              },
              update: {
                name: r.name,
                roleOrTitle: r.roleOrTitle ?? null,
                rating: r.rating ?? 5,
                comment: r.comment,
                imageUrl: r.imageUrl ?? null,
                userAvatarUrl: r.userAvatarUrl ?? null,
                userId: r.userId ?? null,
                isApproved: r.isApproved !== undefined ? r.isApproved : true,
              },
            });
          }
        }
      }, { timeout: 60000 });

      // Restore MongoDB WhatsApp Collections
      let sessionCount = 0;
      if (whatsAppSessions && whatsAppSessions.length > 0) {
        for (const session of whatsAppSessions) {
          await WhatsAppSession.findOneAndUpdate(
            { userId: session.userId },
            {
              userId: session.userId,
              sessionData: session.sessionData,
              status: session.status || 'DISCONNECTED',
              phoneNumber: session.phoneNumber ?? null,
              lastConnectedAt: session.lastConnectedAt ? new Date(session.lastConnectedAt) : null,
            },
            { upsert: true, new: true }
          );
          sessionCount++;
        }
      }

      if (whatsAppAuthKeys && whatsAppAuthKeys.length > 0) {
        for (const key of whatsAppAuthKeys) {
          await WhatsAppAuthKey.findOneAndUpdate(
            { userId: key.userId, keyId: key.keyId },
            {
              userId: key.userId,
              keyId: key.keyId,
              data: key.data,
            },
            { upsert: true, new: true }
          );
        }
      }

      totalRestored = {
        users: users?.length || 0,
        organizations: organizations?.length || 0,
        santri: santris?.length || 0,
        kelas: kelases?.length || 0,
        hafalan: hafalans?.length || 0,
        murajaah: murajaahs?.length || 0,
        absensi: absensis?.length || 0,
        reviews: reviews?.length || 0,
        whatsappSessions: sessionCount,
      };
    } else {
      // Legacy V1 Format
      const { santris, kelases, hafalans, murajaahs, murajaahHistories, absensis } = payload.data;

      await prisma.$transaction(async (tx: any) => {
        // Clear existing records for this user
        await tx.hafalan.deleteMany({ where: { userId: targetUserId } });
        await tx.murajaahSchedule.deleteMany({ where: { userId: targetUserId } });
        await tx.murajaahHistory.deleteMany({ where: { userId: targetUserId } });
        await tx.absensi.deleteMany({ where: { userId: targetUserId } });
        await tx.santri.deleteMany({ where: { userId: targetUserId } });
        await tx.kelas.deleteMany({ where: { userId: targetUserId } });

        // Re-insert Kelases
        if (kelases && kelases.length > 0) {
          await tx.kelas.createMany({
            data: kelases.map((k: any) => ({
              id: k.id,
              name: k.name,
              description: k.description,
              userId: targetUserId,
              createdAt: k.createdAt ? new Date(k.createdAt) : new Date(),
            })),
          });
        }

        // Re-insert Santris
        if (santris && santris.length > 0) {
          await tx.santri.createMany({
            data: santris.map((s: any) => ({
              id: s.id,
              name: s.name,
              parentName: s.parentName,
              parentPhone: s.parentPhone,
              kelasId: s.kelasId,
              isActive: s.isActive ?? true,
              userId: targetUserId,
              createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
              deletedAt: s.deletedAt ? new Date(s.deletedAt) : null,
            })),
          });
        }

        // Re-insert Hafalans
        if (hafalans && hafalans.length > 0) {
          await tx.hafalan.createMany({
            data: hafalans.map((h: any) => ({
              id: h.id,
              santriId: h.santriId,
              surahNumber: h.surahNumber,
              surahName: h.surahName,
              ayatStart: h.ayatStart,
              ayatEnd: h.ayatEnd,
              predikat: h.predikat,
              type: h.type || 'ZIYADAH',
              isHafalanAwal: h.isHafalanAwal ?? false,
              date: new Date(h.date),
              notes: h.notes,
              userId: targetUserId,
              createdAt: h.createdAt ? new Date(h.createdAt) : new Date(),
            })),
          });
        }

        // Re-insert Murajaah Schedules
        if (murajaahs && murajaahs.length > 0) {
          await tx.murajaahSchedule.createMany({
            data: murajaahs.map((m: any) => ({
              id: m.id,
              santriId: m.santriId,
              surahNumber: m.surahNumber,
              surahName: m.surahName,
              ayatRange: m.ayatRange || null,
              isSelected: m.isSelected ?? true,
              lastReviewDate: m.lastReviewDate ? new Date(m.lastReviewDate) : null,
              priorityScore: m.priorityScore ?? 0,
              userId: targetUserId,
              createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
            })),
          });
        }

        if (murajaahHistories && murajaahHistories.length > 0) {
          await tx.murajaahHistory.createMany({
            data: murajaahHistories.map((mh: any) => ({
              id: mh.id,
              santriId: mh.santriId,
              surahNumber: mh.surahNumber,
              surahName: mh.surahName,
              ayatRange: mh.ayatRange || null,
              status: mh.status || 'BELUM',
              date: mh.date ? new Date(mh.date) : new Date(),
              userId: targetUserId,
              createdAt: mh.createdAt ? new Date(mh.createdAt) : new Date(),
            })),
          });
        }

        if (absensis && absensis.length > 0) {
          await tx.absensi.createMany({
            data: absensis.map((a: any) => ({
              id: a.id,
              santriId: a.santriId,
              date: new Date(a.date),
              status: a.status,
              notes: a.notes ?? null,
              userId: targetUserId,
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            })),
          });
        }
      }, { timeout: 60000 });

      totalRestored = {
        users: 0,
        organizations: 0,
        santri: santris?.length || 0,
        kelas: kelases?.length || 0,
        hafalan: hafalans?.length || 0,
        murajaah: murajaahs?.length || 0,
        absensi: absensis?.length || 0,
        reviews: 0,
        whatsappSessions: 0,
      };
    }

    // Invalidate Redis Caches
    await DashboardService.invalidateCache();

    // Log Restore Success in MongoDB
    await BackupLog.create({
      userId: targetUserId,
      filename: `restore_from_${Date.now()}.hfk`,
      checksum: providedChecksum || computedChecksum,
      sizeBytes: Buffer.byteLength(cleanEncryptedData, 'utf8'),
      status: 'RESTORED',
      telegramSent: false,
    });

    return {
      success: true,
      message: 'Restore data berhasil dilakukan tanpa kendala',
      totalRestored,
    };
  }

  async getBackupHistory(userId: string, role?: string) {
    const query = role === 'SUPERADMIN' ? {} : { userId };
    const logs = await BackupLog.find(query).sort({ createdAt: -1 }).limit(100).exec();
    return logs;
  }
}

