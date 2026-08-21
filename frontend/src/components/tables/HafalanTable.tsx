'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HafalanItem } from '../../hooks/useHafalan';
import { Calendar, Trash2, BookOpen, User, Edit3 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HafalanTableProps {
  items: HafalanItem[];
  onDelete: (item: HafalanItem) => void;
  onEdit?: (item: HafalanItem) => void;
  isLoading?: boolean;
}

export function HafalanTable({ items, onDelete, onEdit, isLoading }: HafalanTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl glass animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-bold font-outfit text-foreground">Tidak Ada Riwayat Hafalan</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Belum ada setoran hafalan yang dicatat atau filter pencarian tidak menemukan hasil.
        </p>
      </div>
    );
  }

  const getPredikatBadge = (predikat: string) => {
    switch (predikat) {
      case 'MUMTAZ':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">MUMTAZ</span>;
      case 'JAYYID_JIDDAN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0E8991]/15 text-[#0E8991] dark:text-[#1bb2bd] border border-[#0E8991]/30">JAYYID JIDDAN</span>;
      case 'JAYYID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">JAYYID</span>;
      case 'MAQBUL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border border-[#EAA27C]/30">MAQBUL</span>;
      case 'ULANG':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">ULANG</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-foreground border border-border">{predikat}</span>;
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-4 px-6">Tanggal</th>
              <th className="py-4 px-6">Santri</th>
              <th className="py-4 px-6">Surat & Ayat</th>
              <th className="py-4 px-6">Predikat</th>
              <th className="py-4 px-6">Catatan</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{item.santri?.name || 'Santri'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-foreground">
                      QS. {item.surahName} ({item.surahNumber})
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Ayat {item.ayatStart} - {item.ayatEnd}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getPredikatBadge(item.predikat)}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground max-w-xs truncate font-medium">
                    {item.notes || '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                          title="Edit Record Hafalan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer"
                        title="Hapus Record Hafalan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3.5">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="p-5 rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-foreground text-sm">QS. {item.surahName} ({item.surahNumber})</h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Ayat {item.ayatStart} - {item.ayatEnd}</p>
                </div>
                {getPredikatBadge(item.predikat)}
              </div>

              {item.notes && (
                <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40 font-medium">
                  {item.notes}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border font-medium">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{item.santri?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      title="Edit Record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all cursor-pointer"
                    title="Hapus Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
