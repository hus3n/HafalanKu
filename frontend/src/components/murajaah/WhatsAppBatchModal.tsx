'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Smartphone,
  AlertCircle,
  ExternalLink,
  Ban,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  MurajaahItem,
  useSendBatchWhatsAppMurajaah,
  useMurajaahBatchStatus,
  useCancelMurajaahBatch,
} from '../../hooks/useMurajaah';
import { useQueryClient } from '@tanstack/react-query';

export interface BatchSantriGroup {
  santriId: string;
  santriName: string;
  parentName: string;
  parentPhone: string;
  kelasName: string;
  surahs: MurajaahItem[];
}

interface WhatsAppBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroups: BatchSantriGroup[];
  existingBatchId?: string | null;
}

export function WhatsAppBatchModal({
  isOpen,
  onClose,
  selectedGroups,
  existingBatchId,
}: WhatsAppBatchModalProps) {
  const queryClient = useQueryClient();
  const sendBatchMutation = useSendBatchWhatsAppMurajaah();
  const cancelBatchMutation = useCancelMurajaahBatch();

  const [activeBatchId, setActiveBatchId] = useState<string | null>(existingBatchId || null);
  const [prevExistingBatchId, setPrevExistingBatchId] = useState<string | null>(existingBatchId || null);
  const [delayStrategy, setDelayStrategy] = useState<
    'random' | 'fixed-5' | 'fixed-10' | 'fixed-15' | 'fixed-20'
  >('random');
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (existingBatchId !== prevExistingBatchId) {
    setPrevExistingBatchId(existingBatchId || null);
    setActiveBatchId(existingBatchId || null);
  }

  // Poll batch status from server
  const { data: batchStatus } = useMurajaahBatchStatus(
    activeBatchId || undefined
  );

  if (!isOpen) return null;

  const total = batchStatus ? batchStatus.total : selectedGroups.length;
  const sentCount = batchStatus ? batchStatus.sent : 0;
  const failCount = batchStatus ? batchStatus.failed : 0;
  const pendingCount = batchStatus ? batchStatus.pending : total;

  const isSending =
    batchStatus?.status === 'QUEUED' ||
    batchStatus?.status === 'IN_PROGRESS' ||
    sendBatchMutation.isPending;

  const isFinished =
    batchStatus?.status === 'COMPLETED' || batchStatus?.status === 'CANCELLED';

  const progressPercent = total > 0 ? Math.round(((sentCount + failCount) / total) * 100) : 0;

  const generateMarkdownMessage = (group: BatchSantriGroup) => {
    const item = group.surahs[0];
    const hafalanInfo = item?.hafalanTodayText
      ? `📜 *Setoran Hafalan Hari Ini:*\n✨ *${item.hafalanTodayText}*`
      : '📜 *Setoran Hafalan Hari Ini:*\n_Belum ada setoran baru hari ini_';
    const surahText = item
      ? `*Surah #${item.selectedSurahNumber || item.surahNumber} ${
          item.selectedSurahName || item.surahName
        }* ${item.ayatRange ? `(${item.ayatRange})` : ''}`
      : '*Surah Pilihan*';

    return `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${group.parentName}* (Wali dari Ananda *${group.santriName}* - ${group.kelasName})\n\nBerikut adalah laporan capaian hafalan dan jadwal murajaah ananda hari ini:\n\n${hafalanInfo}\n\n📖 *Target Murajaah di Rumah:*\n${surahText}\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan dampingi ananda mengulang murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* ke nomor Ustadz agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih atas perhatian dan kerja samanya.\n_HafalanKu Automatic Gateway_`;
  };

  const handleStartBatchSend = async () => {
    setSubmitError(null);
    try {
      const santriIds = selectedGroups.map((g) => g.santriId);
      const res = await sendBatchMutation.mutateAsync({
        santriIds,
        delayStrategy,
      });

      if (res.batchId) {
        setActiveBatchId(res.batchId);
      }
      queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftarkan antrean pengiriman massal ke server';
      setSubmitError(msg);
    }
  };

  const handleCancelBatch = async () => {
    if (!activeBatchId) return;
    if (window.confirm('Apakah Anda yakin ingin membatalkan sisa antrean pengiriman WhatsApp ini?')) {
      try {
        await cancelBatchMutation.mutateAsync(activeBatchId);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal membatalkan batch';
        alert(msg);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                  Pengiriman WA Massal Server-Side
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dikelola mandiri oleh background worker server HafalanKu. Kebal tutup halaman & drop sementara.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Tutup Modal (Antrean tetap berjalan di server)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Persistent Server Execution Highlight Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold">Keamanan & Keandalan Pengiriman Terjamin:</span>
              <p className="text-[11px] text-muted-foreground">
                Antrean diproses langsung oleh server secara sekuensial dengan jeda anti-banned. Anda dapat menutup browser atau mematikan perangkat kapan saja tanpa menghentikan pengiriman.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Progress Bar Section (When sending or finished) */}
          {(isSending || isFinished || batchStatus) && (
            <div className="space-y-2.5 p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <div className="flex items-center gap-2">
                  <span>
                    {isFinished
                      ? batchStatus?.status === 'CANCELLED'
                        ? '🛑 Antrean Dibatalkan'
                        : `🎉 Selesai! (Terkirim: ${sentCount}, Gagal: ${failCount})`
                      : `Status Server: ${sentCount + failCount} / ${total} Diproses`}
                  </span>
                  {isSending && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Aktif di Background
                    </span>
                  )}
                </div>
                <span>{progressPercent}%</span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                <motion.div
                  className={`h-full rounded-full transition-all ${
                    failCount > 0 && isFinished
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Berhasil: {sentCount}
                  </span>
                  <span className="text-rose-500 font-bold">✗ Gagal: {failCount}</span>
                  <span className="text-amber-500 font-bold">⏳ Sisa: {pendingCount}</span>
                </div>
                {isSending && (
                  <button
                    onClick={handleCancelBatch}
                    disabled={cancelBatchMutation.isPending}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  >
                    <Ban className="w-3 h-3" />
                    <span>Batalkan Sisa Antrean</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Settings Section (Before Submitting) */}
          {!isSending && !isFinished && !batchStatus && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                ⚙️ Pengaturan Jeda Pengiriman (Anti-Spam WhatsApp)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <select
                  value={delayStrategy}
                  onChange={(e) => setDelayStrategy(e.target.value as 'random' | 'fixed-5' | 'fixed-10' | 'fixed-15' | 'fixed-20')}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="random">🔄 Jeda Acak (10s, 15s, 20s) - Sangat Aman</option>
                  <option value="fixed-5">⏱️ Jeda Tetap 5 Detik (Cepat)</option>
                  <option value="fixed-10">⏱️ Jeda Tetap 10 Detik</option>
                  <option value="fixed-15">⏱️ Jeda Tetap 15 Detik</option>
                  <option value="fixed-20">⏱️ Jeda Tetap 20 Detik</option>
                </select>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  {delayStrategy === 'random'
                    ? 'Variasi jeda acak (10–20 detik) otomatis untuk mengamankan nomor dari deteksi spam WhatsApp.'
                    : `Mengirim pesan dengan jeda interval pasti ${
                        delayStrategy.split('-')[1]
                      } detik antar santri.`}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Server Jobs List (If batch has started) */}
          {batchStatus?.jobs && batchStatus.jobs.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <label className="text-xs font-bold text-foreground block">
                Daftar Pengiriman Santri:
              </label>
              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background max-h-44 overflow-y-auto">
                {batchStatus.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-foreground truncate">
                        {job.santriName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Wali: {job.parentName} ({job.parentPhone})
                      </div>
                      {job.errorMessage && (
                        <div className="text-[10px] text-rose-500 truncate">
                          {job.errorMessage}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 ml-2">
                      {job.status === 'SENT' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> Terkirim
                        </span>
                      )}
                      {job.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          <Loader2 className="w-3 h-3 animate-spin" /> Mengirim...
                        </span>
                      )}
                      {job.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> Antrean
                        </span>
                      )}
                      {job.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Gagal
                        </span>
                      )}
                      {job.status === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          Batal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Markdown Message Sample Preview Before Sending */
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <label className="text-xs font-bold text-foreground block">
                Pratinjau Format Pesan WhatsApp:
              </label>
              {selectedGroups.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-background/80 border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto text-foreground">
                  {generateMarkdownMessage(selectedGroups[0])}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <div>
              {isSending && (
                <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Aman untuk menutup modal ini
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isSending && !isFinished && !batchStatus && (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleStartBatchSend}
                    disabled={sendBatchMutation.isPending || selectedGroups.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendBatchMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Kirim Pengingat ({selectedGroups.length} WA)</span>
                  </button>
                </>
              )}

              {isSending && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Jalankan di Background & Tutup</span>
                </button>
              )}

              {isFinished && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai & Tutup</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
