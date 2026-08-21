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
  Users, 
  Building, 
  BookOpen, 
  Loader2, 
  ArrowRight, 
  Info,
  RefreshCw
} from 'lucide-react';
import { 
  useBulkImportPreview, 
  useBulkImportExecute, 
  downloadImportTemplate, 
  BulkImportPreviewResult 
} from '../../hooks/useSantri';

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
  const [executionResult, setExecutionResult] = useState<{ createdSantriCount: number; createdKelasCount: number; createdHafalanCount: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = useBulkImportPreview();
  const executeMutation = useBulkImportExecute();

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setFileBase64(null);
    setPreviewData(null);
    setExecutionResult(null);
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
      const res = await executeMutation.mutateAsync(validRows);
      setExecutionResult(res.data);
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data impor');
    }
  };

  if (!isOpen) return null;

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

        {/* STEP 2: PREVIEW TABLE */}
        {step === 'preview' && previewData && (
          <div className="space-y-6">
            {/* Stats Overview Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm text-center">
                <p className="text-xs text-muted-foreground font-medium">Total Santri</p>
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
                <p className="text-xs text-muted-foreground font-medium">Status Baris</p>
                <p className="text-lg font-bold font-outfit mt-0.5 text-emerald-600">
                  {previewData.summary.validRows} / {previewData.summary.totalRows}
                </p>
              </div>
            </div>

            {/* Quota Warning if applicable */}
            {previewData.summary.isQuotaExceeded && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-bold">Batas Kuota Santri Terlampaui!</p>
                  <p className="mt-0.5">
                    Pengguna perorangan memiliki batas maksimal 20 santri. Saat ini Anda memiliki {previewData.summary.currentSantriCount} santri (sisa kuota: {previewData.summary.remainingQuota}). File ini berisi {previewData.summary.totalSantri} santri baru.
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
                      <th className="py-3 px-4">Wali Murid</th>
                      <th className="py-3 px-4">No HP / WA</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Capaian Hafalan Terdeteksi</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {previewData.rows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-muted/30' : 'bg-rose-500/5'}>
                        <td className="py-3 px-4 text-center font-medium text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{row.namaSantri || '-'}</td>
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
                disabled={executeMutation.isPending || previewData.summary.validRows === 0 || previewData.summary.isQuotaExceeded}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {executeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Konfirmasi & Simpan ({previewData.summary.validRows} Baris)
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
                Impor Data Berhasil Disimpan!
              </h4>
              <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
                Seluruh data santri, kelas, dan riwayat hafalan telah tersimpan aman di sistem database HafalanKu.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
              <div className="p-3 rounded-2xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">Santri Ditambah</p>
                <p className="text-lg font-bold text-primary font-outfit mt-0.5">{executionResult.createdSantriCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">Kelas Dibuat</p>
                <p className="text-lg font-bold text-foreground font-outfit mt-0.5">{executionResult.createdKelasCount}</p>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border text-center">
                <p className="text-xs text-muted-foreground font-medium">Hafalan Dicatat</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-outfit mt-0.5">{executionResult.createdHafalanCount}</p>
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
