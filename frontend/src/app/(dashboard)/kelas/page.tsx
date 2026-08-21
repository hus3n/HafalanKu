'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useKelasList, useCreateKelas, useUpdateKelas, useDeleteKelas, KelasItem } from '../../../hooks/useKelas';
import { KelasForm } from '../../../components/forms/KelasForm';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Building, Users, Edit2, Trash2, ArrowRight, X, AlertTriangle, Loader2 } from 'lucide-react';
import { CreateKelasInput } from 'shared';

export default function KelasListPage() {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<KelasItem | null>(null);
  const [deletingKelas, setDeletingKelas] = useState<KelasItem | null>(null);

  const { data: kelasList = [], isLoading } = useKelasList(search);
  const createMutation = useCreateKelas();
  const updateMutation = useUpdateKelas();
  const deleteMutation = useDeleteKelas();

  const handleCreateSubmit = async (data: CreateKelasInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (data: CreateKelasInput) => {
    if (editingKelas) {
      try {
        await updateMutation.mutateAsync({ id: editingKelas.id, data });
        setEditingKelas(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingKelas) {
      try {
        await deleteMutation.mutateAsync(deletingKelas.id);
        setDeletingKelas(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight">
            Manajemen Kelas / Kelompok
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola kelompok belajar hafalan santri dan pengalokasian santri.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Kelas Baru</span>
        </motion.button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
      </div>

      {/* Class Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : kelasList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold font-outfit text-foreground">Belum Ada Kelas</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Buat kelas pertama Anda untuk mengelompokkan santri binaan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {kelasList.map((kelas, index) => (
              <motion.div
                key={kelas.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#0E8991]/15 text-[#0E8991] dark:text-[#1bb2bd] border border-[#0E8991]/20 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingKelas(kelas)}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingKelas(kelas)}
                        className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-outfit text-foreground group-hover:text-primary transition-colors">
                      {kelas.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-medium">
                      {kelas.description || 'Tidak ada deskripsi.'}
                    </p>
                    <div className="mt-2 text-xs font-bold text-[#0E8991] dark:text-[#1bb2bd] bg-[#0E8991]/10 border border-[#0E8991]/20 px-2.5 py-1 rounded-xl inline-block">
                      Ustadz: {kelas.ustadzName || '-'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{kelas.totalSantri || 0} Santri</span>
                  </div>

                  <Link
                    href={`/kelas/${kelas.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Detail & Santri</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Create Kelas */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] max-w-md w-full border border-border dark:border-[#0E8991]/30 shadow-2xl pointer-events-auto space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-lg font-bold font-outfit text-foreground">
                  Buat Kelas Baru
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <KelasForm
                onSubmit={handleCreateSubmit}
                isLoading={createMutation.isPending}
                submitText="Buat Kelas"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit Kelas */}
      <AnimatePresence>
        {editingKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingKelas(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] max-w-md w-full border border-border dark:border-[#0E8991]/30 shadow-2xl pointer-events-auto space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold font-outfit text-foreground">Edit Kelas</h3>
                <button
                  onClick={() => setEditingKelas(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {updateMutation.isError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs text-center">
                  {updateMutation.error?.message || 'Gagal meng-update kelas.'}
                </div>
              )}

              <KelasForm
                initialValues={{
                  name: editingKelas.name,
                  description: editingKelas.description || '',
                  userId: editingKelas.userId || '',
                }}
                onSubmit={handleUpdateSubmit}
                isLoading={updateMutation.isPending}
                submitText="Perbarui Kelas"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Delete Confirm */}
      <AnimatePresence>
        {deletingKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingKelas(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] max-w-sm w-full border border-destructive/30 shadow-2xl pointer-events-auto space-y-4 relative z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold font-outfit text-foreground">Konfirmasi Hapus</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-foreground">{deletingKelas.name}</span>? Santri di kelas ini akan dilepas status kelasnya.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingKelas(null)}
                  className="flex-1 h-10 rounded-xl border border-border bg-muted/60 text-sm font-semibold hover:bg-muted transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold shadow-lg shadow-destructive/25 hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
