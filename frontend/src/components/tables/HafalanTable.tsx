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
      <div className="glass-card p-12 text-center rounded-2xl border border-white/10">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-semibold font-outfit text-foreground">Tidak Ada Riwayat Hafalan</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Belum ada setoran hafalan yang dicatat atau filter pencarian tidak menemukan hasil.
        </p>
      </div>
    );
  }

  const getPredikatBadge = (predikat: string) => {
    switch (predikat) {
      case 'MUMTAZ':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">MUMTAZ</span>;
      case 'JAYYID_JIDDAN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">JAYYID JIDDAN</span>;
      case 'JAYYID':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">JAYYID</span>;
      case 'MAQBUL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">MAQBUL</span>;
      case 'ULANG':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">ULANG</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-foreground">{predikat}</span>;
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl glass-card border border-white/10 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-4 px-6">Tanggal</th>
              <th className="py-4 px-6">Santri</th>
              <th className="py-4 px-6">Surat & Ayat</th>
              <th className="py-4 px-6">Predikat</th>
              <th className="py-4 px-6">Catatan</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-sm">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{item.santri?.name || 'Santri'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-foreground">
                      QS. {item.surahName} ({item.surahNumber})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ayat {item.ayatStart} - {item.ayatEnd}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getPredikatBadge(item.predikat)}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground max-w-xs truncate">
                    {item.notes || '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                          title="Edit Record Hafalan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
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
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="glass-card p-5 rounded-2xl border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground">QS. {item.surahName} ({item.surahNumber})</h4>
                  <p className="text-xs text-muted-foreground">Ayat {item.ayatStart} - {item.ayatEnd}</p>
                </div>
                {getPredikatBadge(item.predikat)}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{item.santri?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 rounded-lg bg-destructive/10 text-destructive"
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
