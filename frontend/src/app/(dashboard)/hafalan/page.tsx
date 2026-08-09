'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useHafalanList, useDeleteHafalan, useUpdateHafalan, HafalanItem } from '../../../hooks/useHafalan';
import { useSantriList } from '../../../hooks/useSantri';
import { HafalanTable } from '../../../components/tables/HafalanTable';
import { surahList } from 'shared';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Filter, ChevronLeft, ChevronRight, AlertTriangle, Loader2, X } from 'lucide-react';
import { HafalanForm } from '../../../components/forms/HafalanForm';

export default function HafalanHistoryPage() {
  const [page, setPage] = useState(1);
  const [santriId, setSantriId] = useState('');
  const [surahNumber, setSurahNumber] = useState<number | undefined>(undefined);
  const [predikat, setPredikat] = useState('');
  const [itemToDelete, setItemToDelete] = useState<HafalanItem | null>(null);
  const [editingHafalan, setEditingHafalan] = useState<HafalanItem | null>(null);

  const { data, isLoading } = useHafalanList({ page, limit: 10, santriId, surahNumber, predikat });
  const { data: santriData } = useSantriList({ limit: 100 });
  const santriOptions = santriData?.santri || [];
  const deleteMutation = useDeleteHafalan();
  const updateMutation = useUpdateHafalan();

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingHafalan) {
      await updateMutation.mutateAsync({ id: editingHafalan.id, data });
      setEditingHafalan(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight">
            Riwayat Setoran Hafalan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histori catatan hafalan Al-Qur'an santri dan evaluasi pengajar.
          </p>
        </div>

        <Link href="/hafalan/catat">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Setoran Baru</span>
          </motion.button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Filter Santri */}
        <select
          value={santriId}
          onChange={(e) => {
            setSantriId(e.target.value);
            setPage(1);
          }}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Santri</option>
          {santriOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Filter Surat */}
        <select
          value={surahNumber || ''}
          onChange={(e) => {
            setSurahNumber(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Surat</option>
          {surahList.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.latinName}
            </option>
          ))}
        </select>

        {/* Filter Predikat */}
        <select
          value={predikat}
          onChange={(e) => {
            setPredikat(e.target.value);
            setPage(1);
          }}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Predikat</option>
          <option value="MUMTAZ">MUMTAZ</option>
          <option value="JAYYID_JIDDAN">JAYYID JIDDAN</option>
          <option value="JAYYID">JAYYID</option>
          <option value="MAQBUL">MAQBUL</option>
          <option value="ULANG">ULANG</option>
        </select>
      </div>

      {/* Hafalan Table */}
      <HafalanTable
        items={data?.hafalan || []}
        onDelete={(item) => setItemToDelete(item)}
        onEdit={(item) => setEditingHafalan(item)}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{data.hafalan.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{data.meta.total}</span> setoran
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-input bg-background/50 text-muted-foreground disabled:opacity-40 hover:bg-secondary transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {page} / {data.meta.totalPages}
            </span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-input bg-background/50 text-muted-foreground disabled:opacity-40 hover:bg-secondary transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="glass-card p-6 rounded-2xl max-w-sm w-full border border-destructive/20 shadow-2xl pointer-events-auto space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold font-outfit text-foreground">Hapus Record Hafalan</h3>
                  <p className="text-xs text-muted-foreground">
                    Apakah Anda yakin ingin menghapus data setoran QS. {itemToDelete.surahName} (Ayat {itemToDelete.ayatStart}-{itemToDelete.ayatEnd})?
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 h-10 rounded-xl border border-input bg-background/50 text-sm font-medium hover:bg-secondary transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-all flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingHafalan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingHafalan(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="glass-card p-6 md:p-8 rounded-3xl w-full max-w-2xl border border-border/50 shadow-2xl pointer-events-auto overflow-y-auto max-h-[90vh]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-outfit text-foreground">Edit Setoran Hafalan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Perbarui data setoran hafalan santri.</p>
                  </div>
                  <button
                    onClick={() => setEditingHafalan(null)}
                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <HafalanForm
                  initialData={editingHafalan}
                  onSubmitUpdate={handleUpdate}
                  isLoading={updateMutation.isPending}
                />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
