import { WhatsAppQueueJob, WhatsAppBatchSummary } from '../modules/whatsapp/whatsapp.queue.model';
import { WhatsAppService } from '../modules/whatsapp/whatsapp.service';
import { NotificationLog } from '../modules/notification/notification.model';
import { prisma } from '../config/database';

class WhatsAppPersistentQueueWorker {
  private isProcessing: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private whatsappService: WhatsAppService;

  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  public start() {
    console.log('🚀 [WA Persistent Queue] Initializing Background Engine...');
    // 1. Lakukan auto-recovery terhadap job yang terputus akibat server drop/restart sebelumnya
    this.recoverStaleJobs().then(() => {
      // 2. Mulai polling tick loop
      this.scheduleNextTick(2000);
    });
  }

  /**
   * Pulihkan job yang statusnya menggantung di 'PROCESSING' lebih dari 2 menit
   * (biasanya karena server mendadak restart atau crash di tengah kirim).
   */
  public async recoverStaleJobs() {
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const stuckJobs = await WhatsAppQueueJob.find({
        status: 'PROCESSING',
        updatedAt: { $lt: twoMinutesAgo },
      });

      if (stuckJobs.length > 0) {
        console.warn(
          `⚠️ [WA Persistent Queue] Menemukan ${stuckJobs.length} job menggantung akibat restart/drop server. Mengembalikan status ke PENDING...`
        );
        for (const job of stuckJobs) {
          job.status = 'PENDING';
          await job.save();
        }
      }

      // Pastikan batch summary yang menggantung juga diupdate statusnya menjadi IN_PROGRESS
      const activeBatches = await WhatsAppBatchSummary.find({
        status: { $in: ['QUEUED', 'IN_PROGRESS'] },
      });

      for (const batch of activeBatches) {
        const pendingCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'PENDING',
        });
        const sentCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'SENT',
        });
        const failedCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'FAILED',
        });

        if (pendingCount === 0 && (sentCount + failedCount > 0)) {
          batch.status = 'COMPLETED';
          batch.completedAt = new Date();
        } else {
          batch.status = 'IN_PROGRESS';
        }
        batch.pending = pendingCount;
        batch.sent = sentCount;
        batch.failed = failedCount;
        await batch.save();
      }
    } catch (err: any) {
      console.error('❌ [WA Persistent Queue] Gagal menjalankan recoverStaleJobs:', err.message || err);
    }
  }

  private scheduleNextTick(delayMs: number = 3000) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.processNextJob().catch((err) => {
        console.error('❌ [WA Persistent Queue] Error in processNextJob tick:', err);
      }).finally(() => {
        this.scheduleNextTick(3000);
      });
    }, delayMs);
  }

  /**
   * Mengambil 1 job PENDING tertua, mengirimnya dengan Baileys WhatsApp Gateway,
   * dan mencatat jeda waktu anti-spam sebelum job berikutnya.
   */
  public async processNextJob() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;

      // Cari job PENDING berikutnya yang scheduledAt-nya sudah tiba
      const nextJob = await WhatsAppQueueJob.findOne({
        status: 'PENDING',
        scheduledAt: { $lte: new Date() },
      }).sort({ scheduledAt: 1, createdAt: 1 });

      if (!nextJob) {
        this.isProcessing = false;
        return;
      }

      // Ambil detail batch summary
      const batch = await WhatsAppBatchSummary.findOne({ batchId: nextJob.batchId });
      if (batch && batch.status === 'CANCELLED') {
        nextJob.status = 'CANCELLED';
        await nextJob.save();
        this.isProcessing = false;
        return;
      }

      if (batch && batch.status === 'QUEUED') {
        batch.status = 'IN_PROGRESS';
        batch.startedAt = batch.startedAt || new Date();
        await batch.save();
      }

      // Kunci job agar tidak diambil worker lain
      nextJob.status = 'PROCESSING';
      nextJob.processedAt = new Date();
      await nextJob.save();

      console.log(
        `📨 [WA Persistent Queue] Memproses pengiriman batch ${nextJob.batchId} untuk Santri ${nextJob.santriName} (${nextJob.parentPhone})...`
      );

      // Verifikasi sesi WhatsApp pengguna
      const userId = nextJob.userId;
      let sendResult = await this.whatsappService.sendMessage(
        userId,
        nextJob.parentPhone,
        nextJob.message
      );

      // Fallback: Jika WA ustadz belum aktif dan merupakan anggota organisasi, coba WA Admin Organisasi
      if (!sendResult.success) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true },
          });
          if (user?.organizationId) {
            const org = await prisma.organization.findUnique({
              where: { id: user.organizationId },
              select: { adminId: true },
            });
            if (org?.adminId && org.adminId !== userId) {
              const orgSend = await this.whatsappService.sendMessage(
                org.adminId,
                nextJob.parentPhone,
                nextJob.message
              );
              if (orgSend.success) {
                sendResult = orgSend;
              }
            }
          }
        } catch (e: any) {
          console.warn('[WA Persistent Queue] Fallback org check failed:', e.message);
        }
      }

      // Update hasil pengiriman
      if (sendResult.success) {
        nextJob.status = 'SENT';
        nextJob.completedAt = new Date();
        nextJob.errorMessage = null;
        await nextJob.save();

        // Tandai jadwal murajaah hari ini sebagai sudah dinotifikasi
        try {
          await prisma.murajaahSchedule.updateMany({
            where: { santriId: nextJob.santriId },
            data: { isSelected: true, updatedAt: new Date() },
          });
        } catch (dbErr) {
          // ignore
        }

        // Catat di NotificationLog MongoDB
        try {
          await NotificationLog.create({
            userId: nextJob.userId,
            santriId: nextJob.santriId,
            recipientPhone: nextJob.parentPhone,
            recipientName: nextJob.parentName,
            type: 'MURAJAAH_SCHEDULE',
            message: nextJob.message,
            status: 'SENT',
            errorMessage: null,
            retryCount: nextJob.retryCount,
            createdAt: new Date(),
          });
        } catch (logErr) {
          // ignore
        }
      } else {
        // Gagal kirim
        nextJob.retryCount += 1;
        if (nextJob.retryCount < nextJob.maxRetries && sendResult.error?.includes('socket')) {
          // Jika masalah socket mati/reconnecting, jadwalkan retry 15 detik lagi
          nextJob.status = 'PENDING';
          nextJob.scheduledAt = new Date(Date.now() + 15 * 1000);
          nextJob.errorMessage = `Retry ${nextJob.retryCount}/${nextJob.maxRetries}: ${sendResult.error}`;
        } else {
          nextJob.status = 'FAILED';
          nextJob.completedAt = new Date();
          nextJob.errorMessage = sendResult.error || 'Gagal mengirim pesan via WhatsApp Gateway';
        }
        await nextJob.save();

        // Catat log kegagalan
        try {
          await NotificationLog.create({
            userId: nextJob.userId,
            santriId: nextJob.santriId,
            recipientPhone: nextJob.parentPhone,
            recipientName: nextJob.parentName,
            type: 'MURAJAAH_SCHEDULE',
            message: nextJob.message,
            status: 'FAILED',
            errorMessage: nextJob.errorMessage,
            retryCount: nextJob.retryCount,
            createdAt: new Date(),
          });
        } catch (logErr) {
          // ignore
        }
      }

      // Update counters di Batch Summary
      if (batch) {
        const pendingCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'PENDING',
        });
        const sentCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'SENT',
        });
        const failedCount = await WhatsAppQueueJob.countDocuments({
          batchId: batch.batchId,
          status: 'FAILED',
        });

        batch.pending = pendingCount;
        batch.sent = sentCount;
        batch.failed = failedCount;

        if (pendingCount === 0) {
          batch.status = 'COMPLETED';
          batch.completedAt = new Date();
        }
        await batch.save();
      }

      // Hitung Jeda Anti-Spam (Staggered Delay) sebelum pesan berikutnya
      let delaySeconds = 12; // default
      if (batch?.delayStrategy === 'random') {
        const delays = [10, 15, 20];
        delaySeconds = delays[Math.floor(Math.random() * delays.length)];
      } else if (batch?.delayStrategy?.startsWith('fixed-')) {
        delaySeconds = parseInt(batch.delayStrategy.split('-')[1], 10) || 10;
      }

      console.log(
        `⏳ [WA Persistent Queue] Menunggu ${delaySeconds} detik sebelum memproses antrean pesan selanjutnya...`
      );
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
    } catch (err: any) {
      console.error('❌ [WA Persistent Queue] Error processing job:', err.message || err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Menambahkan daftar santri ke antrean persisten
   */
  public async enqueueBatch(
    userId: string,
    batchId: string,
    jobsData: Array<{
      santriId: string;
      santriName: string;
      parentName: string;
      parentPhone: string;
      kelasName?: string;
      message: string;
    }>,
    delayStrategy: string = 'random'
  ) {
    // 1. Simpan Batch Summary
    await WhatsAppBatchSummary.create({
      batchId,
      userId,
      type: 'MURAJAAH_BATCH',
      total: jobsData.length,
      sent: 0,
      failed: 0,
      pending: jobsData.length,
      status: 'QUEUED',
      delayStrategy,
      startedAt: null,
      completedAt: null,
    });

    // 2. Simpan Job Item
    const queueDocs = jobsData.map((item, index) => ({
      batchId,
      userId,
      santriId: item.santriId,
      santriName: item.santriName,
      parentName: item.parentName,
      parentPhone: item.parentPhone,
      kelasName: item.kelasName || '',
      message: item.message,
      status: 'PENDING' as const,
      retryCount: 0,
      maxRetries: 3,
      scheduledAt: new Date(Date.now() + index * 1000), // staggering sequence
    }));

    await WhatsAppQueueJob.insertMany(queueDocs);

    console.log(
      `✅ [WA Persistent Queue] Berhasil mendaftarkan Batch #${batchId} (${jobsData.length} santri) ke database persisten.`
    );

    // Langsung trigger pengecekan job pertama tanpa menunggu loop tick berikutnya
    setImmediate(() => {
      this.processNextJob().catch((e) => console.error(e));
    });

    return {
      batchId,
      total: jobsData.length,
      status: 'QUEUED',
    };
  }

  /**
   * Ambil status progres batch saat ini
   */
  public async getBatchStatus(userId: string, batchId?: string) {
    let batch: any = null;
    if (batchId) {
      batch = await WhatsAppBatchSummary.findOne({ batchId, userId });
    } else {
      // Ambil batch terbaru yang masih IN_PROGRESS atau QUEUED, atau yang terakhir selesai
      batch = await WhatsAppBatchSummary.findOne({ userId }).sort({ createdAt: -1 });
    }

    if (!batch) {
      return null;
    }

    const jobs = await WhatsAppQueueJob.find({ batchId: batch.batchId }).sort({ createdAt: 1 });

    return {
      batchId: batch.batchId,
      total: batch.total,
      sent: batch.sent,
      failed: batch.failed,
      pending: batch.pending,
      status: batch.status,
      delayStrategy: batch.delayStrategy,
      startedAt: batch.startedAt,
      completedAt: batch.completedAt,
      createdAt: batch.createdAt,
      jobs: jobs.map((j) => ({
        id: j._id.toString(),
        santriId: j.santriId,
        santriName: j.santriName,
        parentName: j.parentName,
        parentPhone: j.parentPhone,
        status: j.status,
        errorMessage: j.errorMessage,
        completedAt: j.completedAt,
      })),
    };
  }

  /**
   * Batalkan sisa antrean batch
   */
  public async cancelBatch(userId: string, batchId: string) {
    const batch = await WhatsAppBatchSummary.findOne({ batchId, userId });
    if (!batch) return false;

    batch.status = 'CANCELLED';
    batch.completedAt = new Date();
    await batch.save();

    await WhatsAppQueueJob.updateMany(
      { batchId, status: 'PENDING' },
      { status: 'CANCELLED', errorMessage: 'Dibatalkan oleh pengguna' }
    );

    return true;
  }
}

export const waQueueWorker = new WhatsAppPersistentQueueWorker();
