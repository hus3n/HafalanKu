'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  Smartphone, 
  Send, 
  MessageSquare, 
  Trash2, 
  Loader2, 
  CheckSquare, 
  Square, 
  History 
} from 'lucide-react';
import { MurajaahItem } from '../../hooks/useMurajaah';

interface MurajaahScheduleTableProps {
  schedules: MurajaahItem[];
  isLoading: boolean;
  selectedSantriIds: string[];
  sendingSantriId: string | null;
  onToggleSelectSantri: (santriId: string) => void;
  onSelectMemorizedSurahChange: (item: MurajaahItem, surahNumStr: string) => void;
  onAyatRangeChange: (item: MurajaahItem, ayatRange: string) => void;
  onSendSingleWa: (item: MurajaahItem) => void;
  onSimulateWaReply: (santriId: string) => void;
  onDeleteSchedule: (id: string, santriName: string) => void;
  formatDateTime: (dateStr: string) => string;
}

export function MurajaahScheduleTable({
  schedules,
  isLoading,
  selectedSantriIds,
  sendingSantriId,
  onToggleSelectSantri,
  onSelectMemorizedSurahChange,
  onAyatRangeChange,
  onSendSingleWa,
  onSimulateWaReply,
  onDeleteSchedule,
  formatDateTime,
}: MurajaahScheduleTableProps) {
  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-card overflow-hidden shadow-xl mb-8">
      <div className="p-4 border-b border-border bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold font-outfit text-emerald-900 dark:text-emerald-100">
            Jadwal Murajaah Hari Ini (Aktif)
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Terdapat <strong className="text-foreground">{schedules.length} Jadwal</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 font-bold text-foreground uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-3 w-10 text-center">Pilih</th>
              <th className="py-3.5 px-4 min-w-[140px]">Waktu Dibuat</th>
              <th className="py-3.5 px-4 min-w-[160px]">Nama Santri</th>
              <th className="py-3.5 px-4 min-w-[220px]">Surat Target Murajaah</th>
              <th className="py-3.5 px-4 min-w-[140px]">Status Murajaah</th>
              <th className="py-3.5 px-4 min-w-[130px]">Status Notif WA</th>
              <th className="py-3.5 px-4 min-w-[230px] text-right">Aksi & WA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground font-medium">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-3"><div className="h-4 w-4 bg-muted rounded mx-auto" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                  <td className="py-3 px-4"><div className="h-9 w-44 bg-muted rounded-xl" /></td>
                  <td className="py-3 px-4"><div className="h-6 w-28 bg-muted rounded-full" /></td>
                  <td className="py-3 px-4"><div className="h-6 w-24 bg-muted rounded-full" /></td>
                  <td className="py-3 px-4"><div className="h-8 w-32 bg-muted rounded-xl ml-auto" /></td>
                </tr>
              ))
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <History className="w-10 h-10 text-muted-foreground opacity-50" />
                    <p className="text-sm font-bold text-foreground">Tidak ada jadwal hari ini</p>
                    <p className="text-xs text-muted-foreground">
                      Tambahkan jadwal secara manual melalui form di atas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {schedules.map((item) => {
                  const isSantriChecked = selectedSantriIds.includes(item.santriId);
                  const effectiveStatus = item.murajaahStatus;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSantriChecked ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onToggleSelectSantri(item.santriId)}
                          className="text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          {isSantriChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-muted-foreground" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{formatDateTime(item.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-foreground text-sm">{item.santriName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border font-semibold">
                            {item.kelasName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={item.selectedSurahNumber}
                            onChange={(e) => onSelectMemorizedSurahChange(item, e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-emerald-500/40 bg-card text-foreground font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer shadow-sm"
                          >
                            {(item.hafalanSurahs || []).map((s) => (
                              <option key={s.surahNumber} value={s.surahNumber} className="bg-card text-foreground py-1">
                                #{s.surahNumber} Surah {s.surahName} {s.ayatRange ? `(${s.ayatRange})` : ''}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Rentang Ayat (Contoh: 1-155)"
                            defaultValue={item.ayatRange || ''}
                            onBlur={(e) => onAyatRangeChange(item, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-full h-8 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-foreground font-semibold text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all placeholder:text-muted-foreground/60"
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {effectiveStatus === 'SUDAH' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 🟢 Sudah
                          </span>
                        )}
                        {effectiveStatus === 'BELUM' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> ⏳ Belum
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.notificationStatus === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> 📲 Terkirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                            <Clock className="w-3.5 h-3.5" /> ⏳ Belum Dikirim
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSendSingleWa(item)}
                            disabled={sendingSantriId === item.santriId}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            title="Kirim notifikasi pengingat jadwal murajaah via WhatsApp Gateway ke Wali Murid"
                          >
                            {sendingSantriId === item.santriId ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                                <span>Mengirim...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>{item.notificationStatus === 'SENT' ? 'Kirim Ulang WA' : 'Kirim WA'}</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => onSimulateWaReply(item.santriId)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            title="Deteksi balasan WA masuk dari nomor wali santri berisi kata kunci 'sudah'"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Terima Balasan WA: &quot;sudah&quot;</span>
                          </button>
                          <button
                            onClick={() => onDeleteSchedule(item.id, item.santriName)}
                            className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer shadow-sm"
                            title="Hapus Jadwal Murajaah Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
