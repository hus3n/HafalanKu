'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SantriItem } from '../../hooks/useSantri';
import { Edit2, Trash2, Phone, Building, User } from 'lucide-react';
import Link from 'next/link';

interface SantriTableProps {
  santriList: SantriItem[];
  onDelete: (santri: SantriItem) => void;
  isLoading?: boolean;
}

export function SantriTable({ santriList, onDelete, isLoading }: SantriTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl glass animate-pulse" />
        ))}
      </div>
    );
  }

  if (santriList.length === 0) {
    return (
      <div className="glass-card p-12 text-center rounded-2xl border border-white/10">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-semibold font-outfit text-foreground">Tidak Ada Data Santri</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Belum ada santri yang terdaftar atau pencarian Anda tidak menemukan hasil.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl glass-card border border-white/10 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-4 px-6">Nama Santri</th>
              <th className="py-4 px-6">Wali Murid</th>
              <th className="py-4 px-6">WhatsApp Wali</th>
              <th className="py-4 px-6">Kelas</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-sm">
            <AnimatePresence>
              {santriList.map((santri, index) => (
                <motion.tr
                  key={santri.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                        {santri.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{santri.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-muted-foreground">{santri.parentName}</td>
                  <td className="py-4 px-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{santri.parentPhone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {santri.kelas ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border/50">
                        <Building className="w-3 h-3 text-primary" />
                        {santri.kelas.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/santri/${santri.id}`}
                        className="p-2 rounded-lg bg-secondary/60 text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                        title="Edit Santri"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(santri)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                        title="Hapus Santri"
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

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {santriList.map((santri, index) => (
            <motion.div
              key={santri.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="glass-card p-5 rounded-2xl border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {santri.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{santri.name}</h4>
                    <p className="text-xs text-muted-foreground">Wali: {santri.parentName}</p>
                  </div>
                </div>
                {santri.kelas && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {santri.kelas.name}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{santri.parentPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/santri/${santri.id}`}
                    className="p-2 rounded-lg bg-secondary/80 text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(santri)}
                    className="p-2 rounded-lg bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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
