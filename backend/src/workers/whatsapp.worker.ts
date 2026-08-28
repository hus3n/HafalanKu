import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/queue';
import { MurajaahService } from '../modules/murajaah/murajaah.service';

const murajaahService = new MurajaahService();

export const whatsappWorker = new Worker(
  'whatsapp-queue',
  async (job: Job) => {
    const { userId, santriId } = job.data;
    
    // Jeda acak antara 10 hingga 20 detik (dalam milidetik)
    // Formula: Math.random() * (Max - Min) + Min
    const minDelay = 10000; // 10 detik
    const maxDelay = 20000; // 20 detik
    const randomDelayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    console.log(`[WhatsAppWorker] Memulai job ${job.id} untuk santri ${santriId}. Menunggu ${randomDelayMs / 1000} detik sebelum mengirim...`);
    await new Promise((resolve) => setTimeout(resolve, randomDelayMs));
    
    try {
      const result = await murajaahService.sendScheduleToWhatsApp(userId, santriId);
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengirim pesan');
      }
      return result;
    } catch (error: any) {
      console.error(`[WhatsAppWorker] Job ${job.id} gagal untuk santri ${santriId}:`, error.message);
      throw error; // Will trigger BullMQ's retry mechanism if configured
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Sangat penting: Hanya proses 1 pesan dalam satu waktu agar antrean delay berjalan berurutan
  }
);

whatsappWorker.on('completed', (job) => {
  console.log(`[WhatsAppWorker] Berhasil mengirim pesan untuk santri ${job.data.santriId}`);
});

whatsappWorker.on('failed', (job, err) => {
  console.error(`[WhatsAppWorker] Gagal mengirim pesan untuk santri ${job?.data.santriId}:`, err.message);
});
