'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSantriList } from '../../../../hooks/useSantri';
import { useRekapGlobalList, useCreateBulkHafalan, RekapGlobalItem, RekapSurahItem } from '../../../../hooks/useHafalan';
import { MultiSelectSurah } from '../../../../components/forms/MultiSelectSurah';
import { Search, Plus, Save, Loader2, BookOpen, AlertTriangle, Filter, Eye, X, CheckCircle2, Award, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HafalanAwalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [selectedSantri, setSelectedSantri] = useState('');
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([]);

  // Modal State for viewing all memorized surahs of a santri
  const [detailModalSantri, setDetailModalSantri] = useState<RekapGlobalItem | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number | 'ALL'>('ALL');

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

    const santriObj = santriData?.santri.find((s: any) => s.id === selectedSantri);

    try {
      await createBulk.mutateAsync({
        santriId: selectedSantri,
        surahs: selectedSurahs,
      });
      toast.success('Hafalan awal berhasil disimpan');
      if (santriObj?.name) {
        setSearch(santriObj.name);
      }
      setSelectedSantri('');
      setSelectedSurahs([]);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan hafalan');
    }
  };

  // Filtered surahs in Detail Modal
  const modalFilteredSurahs = useMemo(() => {
    if (!detailModalSantri?.surahList) return [];
    return detailModalSantri.surahList.filter((s: RekapSurahItem) => {
      const matchSearch = modalSearch === '' || 
        s.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
        s.number.toString().includes(modalSearch) ||
        (s.arabicName && s.arabicName.includes(modalSearch));
      const matchJuz = selectedJuzFilter === 'ALL' || s.juz === selectedJuzFilter;
      return matchSearch && matchJuz;
    });
  }, [detailModalSantri, modalSearch, selectedJuzFilter]);

  // Unique Juz list for modal filter
  const modalAvailableJuz = useMemo(() => {
    if (!detailModalSantri?.surahList) return [];
    const juzSet = new Set<number>();
    detailModalSantri.surahList.forEach(s => juzSet.add(s.juz));
    return Array.from(juzSet).sort((a, b) => b - a); // Sort Juz descending (30, 29, 28...)
  }, [detailModalSantri]);

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
        className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-visible"
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        </div>
        
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
          <div>
            <h2 className="text-lg font-bold">Rekapitulasi Hafalan Santri</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Ringkasan capaian seluruh surat yang telah dikuasai santri.</p>
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama santri..."
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
                <th className="px-6 py-4 w-48">Nama Santri</th>
                <th className="px-6 py-4 w-36">Kelas / Kelompok</th>
                <th className="px-6 py-4">Surat & Ayat yang Telah Dihafal</th>
                <th className="px-6 py-4 text-center w-28">Skor Rata-rata</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingRekap ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="mt-2 text-muted-foreground text-sm">Memuat data hafalan santri...</p>
                  </td>
                </tr>
              ) : rekapData?.rekap.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto opacity-50 mb-3" />
                    <p className="text-muted-foreground font-medium">
                      {search ? `Tidak ada data santri ditemukan dengan nama "${search}"` : 'Belum ada data santri terdaftar.'}
                    </p>
                  </td>
                </tr>
              ) : (
                rekapData?.rekap.map((item: RekapGlobalItem, i: number) => {
                  const surahs = item.surahList || [];
                  const previewSurahs = surahs.slice(0, 2);
                  const remainingCount = surahs.length - 2;

                  return (
                    <motion.tr 
                      key={item.santriId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Nama Santri */}
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {item.santriName}
                      </td>

                      {/* Kelas */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/40">
                          {item.kelasName}
                        </span>
                      </td>

                      {/* Surat & Ayat yang Dihafal (Clean Badges + Counter) */}
                      <td className="px-6 py-4">
                        {item.totalSurah === 0 ? (
                          <span className="text-muted-foreground/60 italic text-xs">Belum ada catatan hafalan</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Total Badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold shadow-2xs">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                              {item.totalSurah} Surat
                            </span>

                            {/* Preview Chips */}
                            {previewSurahs.map((s) => (
                              <span 
                                key={s.number} 
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-background text-foreground/90 border border-border text-xs font-medium"
                              >
                                {s.displayText}
                              </span>
                            ))}

                            {/* Interactive Clickable +X Counter */}
                            {remainingCount > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailModalSantri(item);
                                  setModalSearch('');
                                  setSelectedJuzFilter('ALL');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                              >
                                +{remainingCount} lainnya
                                <Eye className="w-3.5 h-3.5 opacity-80" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Skor Rata-rata */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border min-w-[3rem] ${
                          item.avgScore >= 90 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          item.avgScore >= 80 ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          item.avgScore >= 70 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          item.avgScore > 0 ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-muted text-muted-foreground border-border'
                        }`}>
                          {item.avgScore > 0 ? item.avgScore : '-'}
                        </span>
                      </td>

                      {/* Tombol Aksi Detail */}
                      <td className="px-6 py-4 text-center">
                        {item.totalSurah > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDetailModalSantri(item);
                              setModalSearch('');
                              setSelectedJuzFilter('ALL');
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-secondary hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-600 border border-border/50 transition-all cursor-pointer"
                            title="Buka Rincian Lengkap Hafalan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
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

      {/* ========================================================================= */}
      {/* MODAL RINCIAN SELURUH HAFALAN SANTRI (POLA 1 + POLA 3)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {detailModalSantri && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailModalSantri(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
            />

            {/* Modal Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col pointer-events-auto overflow-hidden relative"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-border bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-500" />
                        Rincian Hafalan Santri
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nama: <strong className="text-foreground">{detailModalSantri.santriName}</strong> &bull; Kelas: <span className="font-medium text-foreground">{detailModalSantri.kelasName}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setDetailModalSantri(null)}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Stats Overview */}
                <div className="px-6 py-3.5 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Total Surat:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                      {detailModalSantri.totalSurah} Surat
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground">Skor Rata-rata:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                      {detailModalSantri.avgScore > 0 ? `${detailModalSantri.avgScore} / 100` : '-'}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar inside Modal */}
                <div className="p-4 border-b border-border/60 bg-card space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari surat dalam daftar hafalan santri ini..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                  </div>

                  {/* Juz Category Filter Tabs */}
                  {modalAvailableJuz.length > 1 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Filter Juz:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedJuzFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedJuzFilter === 'ALL'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        Semua Juz ({detailModalSantri.totalSurah})
                      </button>
                      {modalAvailableJuz.map(juz => {
                        const countInJuz = detailModalSantri.surahList?.filter(s => s.juz === juz).length || 0;
                        return (
                          <button
                            key={juz}
                            type="button"
                            onClick={() => setSelectedJuzFilter(juz)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              selectedJuzFilter === juz
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            Juz {juz} ({countInJuz})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Body: Cards of memorized surahs */}
                <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
                  {modalFilteredSurahs.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground space-y-2">
                      <Search className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-medium">Surat tidak ditemukan dengan kata kunci &quot;{modalSearch}&quot;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modalFilteredSurahs.map((surah) => (
                        <div
                          key={surah.number}
                          className="p-3.5 rounded-2xl border border-border bg-card/60 hover:bg-muted/30 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Surah Number Icon */}
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                              {surah.number}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate group-hover:text-emerald-600 transition-colors">
                                {surah.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-muted-foreground">
                                  {surah.isFullSurah ? `Full (${surah.numberOfAyah} Ayat)` : `Ayat ${surah.ayatStart}-${surah.ayatEnd}`}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-secondary text-secondary-foreground font-medium">
                                  Juz {surah.juz}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Arabic Name & Status Icon */}
                          <div className="flex flex-col items-end shrink-0">
                            {surah.arabicName && (
                              <span className="font-arabic text-sm text-foreground/70">{surah.arabicName}</span>
                            )}
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>Dihafal</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Menampilkan <strong className="text-foreground">{modalFilteredSurahs.length}</strong> dari <strong className="text-foreground">{detailModalSantri.totalSurah}</strong> surat
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailModalSantri(null)}
                    className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-bold transition-all cursor-pointer"
                  >
                    Tutup
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
