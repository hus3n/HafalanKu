'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSantriList, useDeleteSantri, SantriItem } from '../../../hooks/useSantri';
import { useKelasList } from '../../../hooks/useKelas';
import { SantriTable } from '../../../components/tables/SantriTable';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Search, Filter, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';

export default function SantriListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [selectedSantriToDelete, setSelectedSantriToDelete] = useState<SantriItem | null>(null);

  const { data, isLoading } = useSantriList({ page, limit: 10, search, kelasId });
  const { data: kelasOptions = [] } = useKelasList();
  const deleteMutation = useDeleteSantri();

  const handleConfirmDelete = async () => {
    if (selectedSantriToDelete) {
      await deleteMutation.mutateAsync(selectedSantriToDelete.id);
      setSelectedSantriToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight">
            Data Santri
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola daftar santri, wali murid, dan pembagian kelas.
          </p>
        </div>

        <Link href="/santri/tambah">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Santri</span>
          </motion.button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari santri berdasarkan nama..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={kelasId}
            onChange={(e) => {
              setKelasId(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Kelas</option>
            {kelasOptions.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Santri Data Table */}
      <SantriTable
        santriList={data?.santri || []}
        onDelete={(santri) => setSelectedSantriToDelete(santri)}
        isLoading={isLoading}
      />

      {/* Pagination Controls */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{data.santri.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{data.meta.total}</span> santri
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
        {selectedSantriToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSantriToDelete(null)}
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
                  <h3 className="text-lg font-bold font-outfit text-foreground">Konfirmasi Hapus</h3>
                  <p className="text-xs text-muted-foreground">
                    Apakah Anda yakin ingin menghapus santri <span className="font-semibold text-foreground">{selectedSantriToDelete.name}</span>? (Soft delete)
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedSantriToDelete(null)}
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
    </div>
  );
}
