'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSantriList } from '../../../../hooks/useSantri';
import { useRekapGlobalList, useCreateBulkHafalan } from '../../../../hooks/useHafalan';
import { MultiSelectSurah } from '../../../../components/forms/MultiSelectSurah';
import { Search, Plus, Save, Loader2, BookOpen, AlertTriangle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HafalanAwalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [selectedSantri, setSelectedSantri] = useState('');
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);

  const { data: santriData, isLoading: isLoadingSantri } = useSantriList({ limit: 1000 });
  const { data: rekapData, isLoading: isLoadingRekap } = useRekapGlobalList({ page, limit: 10, search });
  const createBulk = useCreateBulkHafalan();

  const handleSimpan = async () => {
    if (!selectedSantri) {
      toast.error('Silakan pilih nama santri terlebih dahulu');
      return;
    }
    if (selectedSurahs.length === 0) {
      toast.error('Silakan pilih minimal 1 surat');
      return;
    }

    try {
      await createBulk.mutateAsync({
        santriId: selectedSantri,
        surahs: selectedSurahs,
      });
      toast.success('Hafalan awal berhasil disimpan');
      setSelectedSantri('');
      setSelectedSurahs([]);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan hafalan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-outfit text-foreground flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-500" />
          Hafalan Awal Santri
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Catat daftar surat yang sudah dihafal oleh santri sebelum menggunakan aplikasi HafalanKu secara massal.
        </p>
      </div>

      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-500" />
          Input Hafalan Awal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-5 space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Nama Santri</label>
            <select
              value={selectedSantri}
              onChange={(e) => setSelectedSantri(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all disabled:opacity-50"
              disabled={isLoadingSantri || createBulk.isPending}
            >
              <option value="">-- Pilih Santri --</option>
              {santriData?.santri.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.kelas?.name || 'Tanpa Kelas'})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 space-y-2">
            <label className="text-sm font-semibold text-foreground/80">Surat yang Dihafal</label>
            <MultiSelectSurah 
              selectedSurahs={selectedSurahs}
              onChange={setSelectedSurahs}
              disabled={createBulk.isPending}
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleSimpan}
              disabled={createBulk.isPending || !selectedSantri || selectedSurahs.length === 0}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {createBulk.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table Section */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <h2 className="text-lg font-bold">Rekapitulasi Global</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Santri</th>
                <th className="px-6 py-4">Kelas / Kelompok</th>
                <th className="px-6 py-4">Surat yang Telah Dihafal</th>
                <th className="px-6 py-4 text-center">Skor Rata-rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingRekap ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-2 text-muted-foreground text-sm">Memuat data rekapitulasi...</p>
                  </td>
                </tr>
              ) : rekapData?.rekap.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-50 mb-3" />
                    <p className="text-muted-foreground font-medium">Belum ada data hafalan</p>
                  </td>
                </tr>
              ) : (
                rekapData?.rekap.map((item: any, i: number) => (
                  <motion.tr 
                    key={item.santriId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {item.santriName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {item.kelasName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="max-w-md">
                        {item.totalSurah === 0 ? (
                          <span className="italic opacity-60">Belum ada hafalan</span>
                        ) : (
                          <span className="font-medium text-foreground/80 leading-relaxed">
                            {item.surahText}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center justify-center min-w-[3rem] ${
                          item.avgScore >= 90 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          item.avgScore >= 80 ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          item.avgScore >= 70 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          item.avgScore > 0 ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-muted text-muted-foreground border-border'
                        }`}>
                          {item.avgScore > 0 ? item.avgScore : '-'}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {rekapData?.meta && rekapData.meta.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-medium text-foreground">{rekapData.rekap.length}</span> dari <span className="font-medium text-foreground">{rekapData.meta.total}</span> santri
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-input text-sm hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === rekapData.meta.totalPages}
                className="px-3 py-1.5 rounded-lg border border-input text-sm hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
