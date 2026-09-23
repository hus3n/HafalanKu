'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { MurajaahItem } from '../../hooks/useMurajaah';

interface MurajaahHistoryTableProps {
  histories: MurajaahItem[];
  isLoading: boolean;
  formatDate: (dateStr: string) => string;
}

export function MurajaahHistoryTable({
  histories,
  isLoading,
  formatDate,
}: MurajaahHistoryTableProps) {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xl opacity-90">
      <div className="p-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-bold font-outfit text-muted-foreground">
            Riwayat Murajaah (&gt; 24 Jam)
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          Menampilkan <strong className="text-foreground">{histories.length} Riwayat</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse opacity-80 hover:opacity-100 transition-opacity">
          <thead>
            <tr className="border-b border-border bg-muted/70 font-bold text-foreground uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 min-w-[140px]">Tanggal Riwayat</th>
              <th className="py-3.5 px-4 min-w-[160px]">Nama Santri</th>
              <th className="py-3.5 px-4 min-w-[220px]">Surat Yang Dimurajaah</th>
              <th className="py-3.5 px-4 min-w-[140px]">Status Akhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground font-medium">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 px-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-32 bg-muted rounded" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-44 bg-muted rounded" /></td>
                  <td className="py-3 px-4"><div className="h-6 w-28 bg-muted rounded-full" /></td>
                </tr>
              ))
            ) : histories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <History className="w-10 h-10 text-muted-foreground opacity-50" />
                    <p className="text-sm font-bold text-muted-foreground">Tidak ada riwayat murajaah</p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {histories.map((item) => {
                  const status = item.status || item.murajaahStatus;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-muted-foreground text-sm">{item.santriName}</div>
                        <div className="text-[11px] opacity-70 flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-muted border border-border font-semibold">
                            {item.kelasName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-muted-foreground">
                          #{item.surahNumber || item.selectedSurahNumber} {item.surahName || item.selectedSurahName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {status === 'SUDAH' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-700/70 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sudah
                          </span>
                        )}
                        {(status === 'TIDAK_DIMURAJAAH' || status === 'BELUM') && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-700/70 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> {status === 'TIDAK_DIMURAJAAH' ? 'Tidak Dimurajaah' : 'Belum'}
                          </span>
                        )}
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
