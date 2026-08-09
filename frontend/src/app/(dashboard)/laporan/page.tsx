'use client';

import React, { useState } from 'react';
import { useReportRecap, downloadExcelReport } from '../../../hooks/useReport';
import { useSantriList } from '../../../hooks/useSantri';
import { useKelasList } from '../../../hooks/useKelas';
import { ReportTable } from '../../../components/tables/ReportTable';
import { motion } from 'motion/react';
import { Download, Filter, BookOpen, Award, Loader2, FileSpreadsheet } from 'lucide-react';

export default function LaporanPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState<number | undefined>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number | undefined>(currentDate.getFullYear());
  const [kelasId, setKelasId] = useState('');
  const [santriId, setSantriId] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading } = useReportRecap({ month, year, kelasId, santriId });
  const { data: santriData } = useSantriList({ limit: 100 });
  const { data: kelasList = [] } = useKelasList();

  const santriOptions = santriData?.santri || [];

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExcelReport({ month, year, kelasId, santriId });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const monthsList = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-2">
            Laporan Rekapitulasi Hafalan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap bulanan capaian setoran hafalan santri & unduh file Excel.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/25 transition-all self-start sm:self-auto"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>Download Format Excel (.xlsx)</span>
        </motion.button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Filter Bulan */}
        <select
          value={month || ''}
          onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Bulan</option>
          {monthsList.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Filter Tahun */}
        <select
          value={year || ''}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Tahun</option>
          <option value={2026}>2026</option>
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
        </select>

        {/* Filter Kelas */}
        <select
          value={kelasId}
          onChange={(e) => setKelasId(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>

        {/* Filter Santri */}
        <select
          value={santriId}
          onChange={(e) => setSantriId(e.target.value)}
          className="h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">Semua Santri</option>
          {santriOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Recap Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] font-medium text-muted-foreground uppercase">Total Setoran</p>
            <p className="text-xl font-bold font-outfit text-foreground mt-1">{summary.totalSetoran}</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-emerald-500/20 text-center">
            <p className="text-[11px] font-medium text-emerald-400 uppercase">MUMTAZ</p>
            <p className="text-xl font-bold font-outfit text-emerald-400 mt-1">{summary.predikatCount.MUMTAZ || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-teal-500/20 text-center">
            <p className="text-[11px] font-medium text-teal-400 uppercase">JAYYID JIDDAN</p>
            <p className="text-xl font-bold font-outfit text-teal-400 mt-1">{summary.predikatCount.JAYYID_JIDDAN || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-blue-500/20 text-center">
            <p className="text-[11px] font-medium text-blue-400 uppercase">JAYYID</p>
            <p className="text-xl font-bold font-outfit text-blue-400 mt-1">{summary.predikatCount.JAYYID || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-amber-500/20 text-center">
            <p className="text-[11px] font-medium text-amber-400 uppercase">MAQBUL</p>
            <p className="text-xl font-bold font-outfit text-amber-400 mt-1">{summary.predikatCount.MAQBUL || 0}</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-rose-500/20 text-center">
            <p className="text-[11px] font-medium text-rose-400 uppercase">ULANG</p>
            <p className="text-xl font-bold font-outfit text-rose-400 mt-1">{summary.predikatCount.ULANG || 0}</p>
          </div>
        </div>
      )}

      {/* Detailed Records Table */}
      <ReportTable records={data?.records || []} isLoading={isLoading} />
    </div>
  );
}
