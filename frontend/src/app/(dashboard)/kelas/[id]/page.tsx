'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useKelasDetail, useAssignSantri, useUnassignSantri } from '../../../../hooks/useKelas';
import { useSantriList } from '../../../../hooks/useSantri';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, UserPlus, Users, Building, Trash2, X, Search, Loader2 } from 'lucide-react';

export default function KelasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: kelas, isLoading, isError } = useKelasDetail(id);
  const { data: unassignedSantriData } = useSantriList({ limit: 100 });
  const assignMutation = useAssignSantri();
  const unassignMutation = useUnassignSantri();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [santriSearch, setSantriSearch] = useState('');

  // Filter santri for assign modal (exclude santri already in this class or soft deleted)
  const availableSantri = (unassignedSantriData?.santri || []).filter(
    (s) => s.kelasId !== id && s.name.toLowerCase().includes(santriSearch.toLowerCase())
  );

  const handleAssign = async (santriId: string) => {
    try {
      await assignMutation.mutateAsync({ kelasId: id, santriId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassign = async (santriId: string) => {
    try {
      await unassignMutation.mutateAsync({ kelasId: id, santriId });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !kelas) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl glass border border-destructive/30 text-center space-y-3">
        <p className="text-sm text-destructive">Data kelas tidak ditemukan atau gagal dimuat.</p>
        <Link href="/kelas" className="inline-block text-xs font-semibold text-primary hover:underline">
          Kembali ke Daftar Kelas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/kelas" className="p-2 rounded-xl bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight">
                {kelas.name}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kelas.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsAssignModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Santri ke Kelas</span>
        </motion.button>
      </div>

      {/* Santri List in Class */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            Daftar Santri ({kelas.santri?.length || 0})
          </h2>
        </div>

        {!kelas.santri || kelas.santri.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-foreground">Belum ada santri di kelas ini.</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Klik tombol di atas untuk memilih dan memasukkan santri.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {kelas.santri.map((santri, index) => (
                <motion.div
                  key={santri.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="p-4 rounded-2xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                      {santri.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{santri.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">Wali: {santri.parentName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnassign(santri.id)}
                    disabled={unassignMutation.isPending}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Keluarkan dari kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Assign Santri */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] max-w-md w-full border border-border dark:border-[#0E8991]/30 shadow-2xl pointer-events-auto space-y-4 max-h-[80vh] flex flex-col relative z-10"
            >
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-lg font-bold font-outfit text-foreground">Pilih Santri</h3>
                  <button
                    onClick={() => setIsAssignModalOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari santri..."
                    value={santriSearch}
                    onChange={(e) => setSantriSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background/50 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[200px]">
                  {availableSantri.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Tidak ada santri yang tersedia untuk ditambahkan.
                    </p>
                  ) : (
                    availableSantri.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors border border-border/30"
                      >
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">Wali: {s.parentName}</p>
                        </div>

                        <button
                          onClick={() => handleAssign(s.id)}
                          disabled={assignMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Pilih</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
