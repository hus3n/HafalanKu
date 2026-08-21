'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldCheck, CheckCircle2, Loader2, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { MurajaahItem, useSendWhatsAppMurajaah } from '../../hooks/useMurajaah';
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
}

export function WhatsAppBatchModal({ isOpen, onClose, selectedGroups }: WhatsAppBatchModalProps) {
  const queryClient = useQueryClient();
  const sendWhatsAppMutation = useSendWhatsAppMurajaah();

  const [isSending, setIsSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  if (!isOpen) return null;

  const total = selectedGroups.length;
  const progressPercent = total > 0 ? Math.round(((currentIndex) / total) * 100) : 0;

  const generateMarkdownMessage = (group: BatchSantriGroup) => {
    const item = group.surahs[0];
    const hafalanInfo = item?.hafalanTodayText ? `📜 *Setoran Hafalan Hari Ini:*\n✨ *${item.hafalanTodayText}*` : '📜 *Setoran Hafalan Hari Ini:*\n_Belum ada setoran baru hari ini_';
    const surahText = item ? `*Surah #${item.selectedSurahNumber || item.surahNumber} ${item.selectedSurahName || item.surahName}* ${item.ayatRange ? `(${item.ayatRange})` : ''}` : '*Surah Pilihan*';

    return `*Assalamu’alaikum Warahmatullahi Wabarakatuh*\n\nYth. Bpk/Ibu *${group.parentName}* (Wali dari Ananda *${group.santriName}* - ${group.kelasName})\n\nBerikut adalah laporan capaian hafalan dan jadwal murajaah ananda hari ini:\n\n${hafalanInfo}\n\n📖 *Target Murajaah di Rumah:*\n${surahText}\n\n--------------------------------------------------\n💬 *PENGINGAT PENTING UNTUK WALI SANTRI:*\nMohon bimbing dan dampingi ananda mengulang murajaah di rumah. Setelah ananda selesai murajaah, *MOHON WAJIB MEMBALAS PESAN WHATSAPP INI DENGAN MENGETIK KATA: "sudah"* ke nomor Ustadz agar status murajaah ananda di sistem kami otomatis ter-update menjadi Selesai (🟢 Sudah Dimurajaah).\n\nTerima kasih atas perhatian dan kerja samanya.\n_HafalanKu Automatic Gateway_`;
  };

  const handleStartBatchSend = async () => {
    setIsSending(true);
    setCurrentIndex(0);
    setLogs([]);
    setIsFinished(false);
    let succ = 0;
    let fail = 0;

    for (let i = 0; i < selectedGroups.length; i++) {
      const group = selectedGroups[i];
      setCurrentIndex(i + 1);

      const waitMsg = `[WAIT] Mengirim pesan (${i + 1}/${total}) ke Wali ${group.santriName} (${group.parentPhone})...`;
      setLogs((prev) => [waitMsg, ...prev]);

      try {
        const res = await sendWhatsAppMutation.mutateAsync(group.santriId);
        if (res.success || res.status === 'SENT' || res.status === 'DELIVERED') {
          succ++;
          const successLog = `[OK] ✅ Sukses terkirim ke ${group.parentName} (${group.parentPhone})`;
          setLogs((prev) => [successLog, ...prev.slice(1)]);
        } else {
          fail++;
          const failLog = `[GAGAL] ❌ Gagal kirim ke ${group.parentName}: ${res.error || 'WhatsApp belum terhubung'}`;
          setLogs((prev) => [failLog, ...prev.slice(1)]);
        }
      } catch (err: any) {
        fail++;
        const errorMsg = err.message || 'Gagal mengirim pesan via WhatsApp Gateway';
        const errorLog = `[GAGAL] ❌ Gagal kirim ke ${group.parentName} (${group.parentPhone}): ${errorMsg}`;
        setLogs((prev) => [errorLog, ...prev.slice(1)]);
      }

      // Anti-Spam Staggered Delay (2 seconds per message)
      if (i < selectedGroups.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setSuccessCount(succ);
    setFailCount(fail);
    setIsSending(false);
    setIsFinished(true);
    queryClient.invalidateQueries({ queryKey: ['murajaah-list'] });
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
                  Kirim Pengingat WA Massal Anti-Spam
                </h3>
                <p className="text-xs text-muted-foreground">
                  Diproses otomatis melalui WhatsApp Gateway terhubung dengan jeda 2 detik per pesan agar aman dari pemblokiran.
                </p>
              </div>
            </div>

            {!isSending && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Info Banner & Selected Count */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Total Santri Terpilih: <strong>{selectedGroups.length} Murid</strong></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2.5 py-1 rounded-md">
              Anti-Spam Active (2s Delay)
            </span>
          </div>

          {/* Progress Bar Section (When sending or finished) */}
          {(isSending || isFinished) && (
            <div className="space-y-2 p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>
                  {isFinished 
                    ? `🎉 Selesai! (Berhasil: ${successCount}, Gagal: ${failCount})` 
                    : `Proses Pengiriman: ${currentIndex} / ${total}`
                  }
                </span>
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
                  transition={{ duration: 0.3 }}
                />
              </div>
              {isSending && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse flex items-center gap-1.5 pt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengirimkan pesan ke nomor WhatsApp Wali Murid...
                </p>
              )}
            </div>
          )}

          {/* Markdown Message Sample Preview */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <label className="text-xs font-bold text-foreground block">
              Contoh Format Pesan WhatsApp (Daftar Surah Berurutan):
            </label>
            {selectedGroups.length > 0 && (
              <div className="p-4 rounded-2xl bg-background/80 border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto text-foreground">
                {generateMarkdownMessage(selectedGroups[0])}
              </div>
            )}

            {/* Real-time Transmission Logs */}
            {logs.length > 0 && (
              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-foreground block">Status Log Pengiriman Server:</label>
                <div className="p-3 rounded-xl bg-black/80 text-emerald-400 text-[11px] font-mono space-y-1 max-h-36 overflow-y-auto border border-emerald-500/20">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={log.startsWith('[GAGAL]') ? 'text-rose-400' : log.startsWith('[OK]') ? 'text-emerald-300' : 'text-amber-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
            {!isSending && !isFinished && (
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengingat ({selectedGroups.length} WA)</span>
                </button>
              </>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
