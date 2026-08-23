'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Loader2, 
  Info,
  Layers,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { 
  useBulkImportPreview, 
  useBulkImportExecute, 
  downloadImportTemplate, 
  BulkImportPreviewResult,
  BulkImportExecutionStats
} from '../../hooks/useSantri';
import { BulkImportMode } from 'shared';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [previewData, setPreviewData] = useState<BulkImportPreviewResult | null>(null);
  const [executionResult, setExecutionResult] = useState<BulkImportExecutionStats | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Mode Impor State
  const [importMode, setImportMode] = useState<BulkImportMode>('MERGE');
  const [replaceConfirmed, setReplaceConfirmed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useBulkImportPreview();
  const executeMutation = useBulkImportExecute();

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setFileBase64(null);
    setPreviewData(null);
    setExecutionResult(null);
    setImportMode('MERGE');
    setReplaceConfirmed(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      alert('Mohon pilih file format Excel (.xlsx atau .xls)');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      setFileBase64(base64);

      try {
        const res = await previewMutation.mutateAsync(base64);
        setPreviewData(res);
        setStep('preview');
      } catch (err: any) {
        alert(err.message || 'Gagal membaca file Excel');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      await downloadImportTemplate();
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh template Excel.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || previewData.rows.length === 0) return;

    if (importMode === 'REPLACE' && !replaceConfirmed) {
      alert('Silakan centang persetujuan penggantian data lama terlebih dahulu.');
      return;
    }

    const validRows = previewData.rows
      .filter((r) => r.isValid)
      .map((r) => ({
        namaSantri: r.namaSantri,
        namaWali: r.namaWali,
        noHpWali: r.noHpWali,
        namaKelas: r.namaKelas || null,
        capaianHafalan: r.capaianHafalan || null,
      }));

    try {
      const res = await executeMutation.mutateAsync({
        rows: validRows,
        mode: importMode,
      });
      setExecutionResult(res.data);
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data impor');
    }
  };

  if (!isOpen) return null;

  // Cek kuota berdasarkan mode yang sedang aktif
  const isQuotaExceeded = importMode === 'REPLACE'
    ? Boolean(previewData?.summary.isQuotaExceededReplace)
    : Boolean(previewData?.summary.isQuotaExceededMerge ?? previewData?.summary.isQuotaExceeded);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="p-6 md:p-8 rounded-3xl bg-card dark:bg-[#0C313A] max-w-4xl w-full border border-border dark:border-[#0E8991]/30 shadow-2xl pointer-events-auto space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-outfit text-foreground">
                Impor Data Santri, Kelas & Hafalan
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Unggah file Excel untuk mendaftarkan santri, kelas, dan riwayat hafalan sekaligus.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: UPLOAD ZONE */}
        {step === 'upload' && (
          <div className="space-y-6">
            {/* Download Template Banner */}
            <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-primary font-outfit flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" /> Belum punya format file Excel?
                </h4>
                <p className="text-xs text-muted-foreground font-medium">
                  Gunakan template 5 kolom resmi kami yang sudah dilengkapi contoh notasi hafalan cerdas.
                </p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                {isDownloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Unduh Template Excel
              </button>
            </div>

            {/* Drag and Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-border dark:border-[#0E8991]/30 hover:border-primary/60 bg-muted/20 hover:bg-muted/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shadow-inner">
                {previewMutation.isPending ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">
                  {previewMutation.isPending ? 'Membaca data file Excel...' : 'Tarik & lepas file Excel ke sini, atau klik untuk memilih'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Mendukung format Microsoft Excel (.xlsx / .xls)
                </p>
              </div>
            </div>

            {/* Smart Notation Quick Cheat Sheet */}
            <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
              <h5 className="text-xs font-bold font-outfit text-foreground flex items-center gap-1.5">
                <Info className="w-4 h-4 text-primary" /> Panduan Notasi Cerdas Kolom Capaian Hafalan:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground font-medium">
                <div className="p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="font-bold text-primary">Juz 30</span>
                  <p className="text-[11px] mt-0.5">Otomatis mencatat seluruh 37 surat di Juz 30 (An-Naba s.d An-Nas).</p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="font-bold text-primary">An-Naba 11</span>
                  <p className="text-[11px] mt-0.5">Mencatat Surat An-Naba ayat 1 s.d 11.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="font-bold text-primary">Al-Mulk - Al-Qalam 21</span>
                  <p className="text-[11px] mt-0.5">Mencatat Al-Mulk (penuh) s.d Al-Qalam ayat 21.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="font-bold text-primary">Juz 30, Al-Mulk - Al-Qalam 21</span>
                  <p className="text-[11px] mt-0.5">Mencatat seluruh Juz 30 + rentang Al-Mulk s.d Al-Qalam 21.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & MODE SELECTION */}
        {step === 'preview' && previewData && (
          <div className="space-y-6">
            {/* Stats Overview Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground font-medium">Total Santri di File</p>
                <p className="text-lg font-bold text-primary font-outfit mt-0.5">{previewData.summary.totalSantri}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground font-medium">Total Kelas</p>
                <p className="text-lg font-bold text-foreground font-outfit mt-0.5">{previewData.summary.totalKelas}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground font-medium">Catatan Hafalan</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit mt-0.5">{previewData.summary.totalHafalanRecords}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground font-medium">Baris Valid</p>
                <p className="text-lg font-bold font-outfit mt-0.5 text-emerald-600">
                  {previewData.summary.validRows} / {previewData.summary.totalRows}
                </p>
              </div>
            </div>

            {/* SELEKSI MODE IMPOR: PERTAHANKAN VS GANTI SEMUA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Pilih Strategi Penyimpanan Data:
                </h4>
                <span className="text-xs text-muted-foreground">
                  Santri aktif saat ini: <strong className="text-foreground">{previewData.summary.currentSantriCount}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Opsi 1: Pertahankan Data Lama (MERGE) */}
                <div
                  onClick={() => setImportMode('MERGE')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    importMode === 'MERGE'
                      ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${importMode === 'MERGE' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-foreground">Pertahankan Data Lama</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Rekomendasi
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Data santri lama <strong>tetap dipertahankan</strong>. Santri baru akan ditambahkan, dan santri yang cocok akan diperbarui tanpa menghapus murid lain.
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <UserPlus className="w-3.5 h-3.5" /> +{previewData.summary.newSantriCount ?? previewData.summary.totalSantri} Santri Baru
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <UserCheck className="w-3.5 h-3.5" /> {previewData.summary.existingMatchCount ?? 0} Cocok/Update
                    </span>
                  </div>
                </div>

                {/* Opsi 2: Ganti Semua Data Lama (REPLACE) */}
                <div
                  onClick={() => setImportMode('REPLACE')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    importMode === 'REPLACE'
                      ? 'border-amber-500 dark:border-amber-400 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20'
                      : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${importMode === 'REPLACE' ? 'bg-amber-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-foreground">Ganti Semua Data Lama</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Reset Total
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      <strong>Menonaktifkan semua {previewData.summary.currentSantriCount} santri lama</strong> dan menggantinya secara bersih dengan santri dari file Excel ini.
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" /> Reset {previewData.summary.currentSantriCount} Data Lama
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {previewData.summary.totalSantri} Santri Pengganti
                    </span>
                  </div>
                </div>
              </div>

              {/* REPLACE WARNING & SAFETY CHECKBOX */}
              {importMode === 'REPLACE' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-amber-900 dark:text-amber-200">
                        Konfirmasi Penggantian Seluruh Data Santri
                      </p>
                      <p className="text-amber-800 dark:text-amber-300">
                        Sebanyak <strong>{previewData.summary.currentSantriCount} santri lama</strong> yang terdaftar saat ini akan dinonaktifkan dan digantikan dengan <strong>{previewData.summary.totalSantri} santri baru</strong> dari file Excel. Mode ini sangat tepat untuk pergantian tahun ajaran atau perbaikan kesalahan input impor sebelumnya.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 pt-2 border-t border-amber-500/20 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={replaceConfirmed}
                      onChange={(e) => setReplaceConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Saya mengerti dan menyetujui data santri lama digantikan dengan data baru dari file Excel ini
                    </span>
                  </label>
                </motion.div>
              )}
            </div>

            {/* Quota Warning if applicable */}
            {isQuotaExceeded && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold">Batas Kuota Santri Terlampaui!</p>
                  <p className="mt-0.5">
                    Pengguna perorangan memiliki batas maksimal 20 santri. 
                    {importMode === 'MERGE' ? (
                      ` Anda saat ini memiliki ${previewData.summary.currentSantriCount} santri aktif (sisa kuota: ${previewData.summary.remainingQuota}). Menambahkan ${previewData.summary.newSantriCount} santri baru melebihi kuota.`
                    ) : (
                      ` File Excel ini berisi ${previewData.summary.totalSantri} santri, melebihi kuota 20 santri.`
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-bold sticky top-0 border-b border-border z-10 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center w-12">No</th>
                      <th className="py-3 px-4">Nama Santri</th>
                      <th className="py-3 px-4">Tipe Data</th>
                      <th className="py-3 px-4">Wali Murid</th>
                      <th className="py-3 px-4">No HP / WA</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Capaian Hafalan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {previewData.rows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-muted/30' : 'bg-rose-500/5'}>
                        <td className="py-3 px-4 text-center font-medium text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{row.namaSantri || '-'}</td>
                        <td className="py-3 px-4">
                          {importMode === 'REPLACE' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                              Pengganti Baru
                            </span>
                          ) : row.isExistingSantri ? (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]" title="Nama cocok dengan santri lama di sistem">
                              Sudah Ada (Update)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                              Santri Baru
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{row.namaWali || '-'}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{row.noHpWali || '-'}</td>
                        <td className="py-3 px-4">
                          {row.namaKelas ? (
                            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-semibold text-[11px]">
                              {row.namaKelas}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {row.capaianHafalan ? (
                            <div>
                              <p className="font-bold text-foreground">{row.capaianHafalan}</p>
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ {row.parsedSurahsSummary}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Tanpa hafalan</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Siap
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-[10px]" title={row.errorMessage}>
                              <AlertTriangle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions Bottom Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                onClick={handleReset}
                disabled={executeMutation.isPending}
                className="px-4 py-2 rounded-xl border border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Ganti File Excel
              </button>

              <button
                onClick={handleExecuteImport}
                disabled={
                  executeMutation.isPending ||
                  previewData.summary.validRows === 0 ||
                  isQuotaExceeded ||
                  (importMode === 'REPLACE' && !replaceConfirmed)
                }
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer ${
                  importMode === 'REPLACE'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25'
                }`}
              >
                {executeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : importMode === 'REPLACE' ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {importMode === 'REPLACE'
                  ? `Konfirmasi & Ganti Semua (${previewData.summary.validRows} Baris)`
                  : `Konfirmasi & Gabungkan (${previewData.summary.validRows} Baris)`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && executionResult && (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold font-outfit text-foreground">
                Impor Data Berhasil Diselesaikan!
              </h4>
              <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
                {executionResult.mode === 'REPLACE'
                  ? 'Seluruh data santri lama telah digantikan secara bersih dengan santri dari file Excel baru.'
                  : 'Santri baru telah ditambahkan dan santri yang cocok telah diperbarui tanpa menghapus data santri lama.'}
              </p>
            </div>

            {/* Dynamic Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
              {executionResult.mode === 'REPLACE' ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground font-medium">Santri Diganti</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-outfit mt-0.5">
                      {executionResult.replacedSantriCount}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground font-medium">Santri Baru</p>
                    <p className="text-lg font-bold text-primary font-outfit mt-0.5">
                      {executionResult.createdSantriCount}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground font-medium">Santri Ditambah</p>
                    <p className="text-lg font-bold text-primary font-outfit mt-0.5">
                      {executionResult.createdSantriCount}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground font-medium">Santri Diperbarui</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit mt-0.5">
                      {executionResult.updatedSantriCount}
                    </p>
                  </div>
                </>
              )}

              <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">Kelas Dibuat</p>
                <p className="text-lg font-bold text-foreground font-outfit mt-0.5">
                  {executionResult.createdKelasCount}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">Hafalan Dicatat</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit mt-0.5">
                  {executionResult.createdHafalanCount}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
