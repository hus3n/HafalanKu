import crypto from 'crypto';
import { prisma } from '../../config/database';
import { BackupLog } from './backup.model';
import { encrypt, decrypt } from '../../utils/encryption';
import { AppError } from '../../utils/AppError';
import { getTelegramBot, getTelegramChatId } from '../../config/telegram';

export class BackupService {
  private calculateSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async createBackup(userId: string) {
    // 1. Export Data (if userId === 'system-auto-backup' or empty, export all)
    const whereClause = (userId && userId !== 'system-auto-backup') ? { userId } : {};

    const [santris, kelases, hafalans, murajaahs] = await Promise.all([
      prisma.santri.findMany({ where: whereClause }),
      prisma.kelas.findMany({ where: whereClause }),
      prisma.hafalan.findMany({ where: whereClause }),
      prisma.murajaahSchedule.findMany({ where: whereClause }),
    ]);

    const backupPayload = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      userId,
      data: {
        santris,
        kelases,
        hafalans,
        murajaahs,
      },
    };

    const payloadJson = JSON.stringify(backupPayload);
    const checksum = this.calculateSha256(payloadJson);
    const encryptedData = encrypt(payloadJson);
    const filename = `backup_hafalanku_${Date.now()}.hfk`;
    const sizeBytes = Buffer.byteLength(encryptedData, 'utf8');

    const bot = getTelegramBot();
    const chatId = getTelegramChatId();
    let telegramSent = false;

    // Standardized file content envelope (.hfk)
    const filePayload = JSON.stringify({
      app: 'HafalanKu',
      version: '1.0',
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
          caption: `📦 Backup HafalanKu\n📅 ${new Date().toLocaleString('id-ID')}\n📁 ${filename}\n🔒 Checksum: ${checksum.substring(0, 16)}...`,
        }, { filename, contentType: 'application/octet-stream' });
        telegramSent = true;
      } catch (err) {
        console.error('[Telegram] Failed to send backup:', err);
      }
    }

    // 2. Log Backup in MongoDB
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

  async restoreBackup(userId: string, encryptedData: string, providedChecksum?: string) {
    // 1. Auto-backup current state first (Safety Criterion)
    await this.createBackup(userId);

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

    // 5. Restore tables
    const { santris, kelases, hafalans, murajaahs } = payload.data;

    await prisma.$transaction(async (tx: any) => {
      // Clear existing records for this user
      await tx.hafalan.deleteMany({ where: { userId } });
      await tx.murajaahSchedule.deleteMany({ where: { userId } });
      await tx.santri.deleteMany({ where: { userId } });
      await tx.kelas.deleteMany({ where: { userId } });

      // Re-insert Kelases
      if (kelases && kelases.length > 0) {
        await tx.kelas.createMany({
          data: kelases.map((k: any) => ({
            id: k.id,
            name: k.name,
            description: k.description,
            userId,
            createdAt: new Date(k.createdAt),
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
            userId,
            createdAt: new Date(s.createdAt),
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
            userId,
            createdAt: new Date(h.createdAt),
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
            userId,
            createdAt: new Date(m.createdAt),
          })),
        });
      }
    });

    // Log Restore Success in MongoDB
    await BackupLog.create({
      userId,
      filename: `restore_from_${Date.now()}.hfk`,
      checksum: providedChecksum || computedChecksum,
      sizeBytes: Buffer.byteLength(cleanEncryptedData, 'utf8'),
      status: 'RESTORED',
      telegramSent: false,
    });

    return {
      success: true,
      message: 'Restore data berhasil dilakukan tanpa kendala',
      totalRestored: {
        santri: santris?.length || 0,
        kelas: kelases?.length || 0,
        hafalan: hafalans?.length || 0,
      },
    };
  }

  async getBackupHistory(userId: string) {
    const logs = await BackupLog.find({ userId }).sort({ createdAt: -1 }).exec();
    return logs;
  }
}
