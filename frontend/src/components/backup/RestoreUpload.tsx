'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  X, 
  ShieldAlert,
  FileCode,
  HardDrive
} from 'lucide-react';
import { useRestoreBackup, RestoreBackupPayload } from '../../hooks/useBackup';

export function RestoreUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPayload, setParsedPayload] = useState<RestoreBackupPayload | null>(null);
  const [fileMeta, setFileMeta] = useState<{ filename: string; size: number; checksum: string; createdAt?: string } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    santri: number;
    kelas: number;
    hafalan: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: restoreBackup, isPending: isRestoring, error: restoreError, reset: resetRestoreMutation } = useRestoreBackup();

  const handleFileSelect = (file: File) => {
    setParseError(null);
    setRestoreResult(null);
    resetRestoreMutation();
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        if (!json.encryptedData || !json.checksum) {
          throw new Error('Format berkas backup tidak valid. Properti encryptedData & checksum tidak ditemukan.');
        }

        if (typeof json.checksum !== 'string' || json.checksum.length !== 64) {
          throw new Error('Integritas berkas rusak. SHA-256 checksum tidak valid (harus 64 karakter hex).');
        }

        setParsedPayload({
          encryptedData: json.encryptedData,
          checksum: json.checksum,
        });

        setFileMeta({
          filename: json.filename || file.name,
          size: file.size,
          checksum: json.checksum,
          createdAt: json.createdAt,
        });
      } catch (err: any) {
        setParsedPayload(null);
        setFileMeta(null);
        setParseError(err.message || 'Gagal membaca berkas backup. Pastikan berkas berupa JSON/HFK terenkripsi yang sah.');
      }
    };

    reader.onerror = () => {
      setParseError('Gagal membaca file dari disk.');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteRestore = () => {
    if (!parsedPayload) return;

    restoreBackup(parsedPayload, {
      onSuccess: (data) => {
        setShowConfirmModal(false);
        setRestoreResult(data.totalRestored);
        // Clear selected file after success
        setSelectedFile(null);
        setParsedPayload(null);
        setFileMeta(null);
      },
      onError: () => {
        setShowConfirmModal(false);
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <AnimatePresence>
        {restoreResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl text-emerald-700 dark:text-emerald-300 flex items-start gap-4 shadow-lg shadow-emerald-500/5"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold font-outfit text-base">Proses Restore Berhasil Dijalankan!</h3>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-300/90">
                Seluruh data telah berhasil dipulihkan. Backup otomatis data sebelumnya juga telah diamankan di sistem.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
                <span className="bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  👥 Santri: <strong>{restoreResult.santri}</strong>
                </span>
                <span className="bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  🏫 Kelas: <strong>{restoreResult.kelas}</strong>
                </span>
                <span className="bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  📖 Hafalan: <strong>{restoreResult.hafalan}</strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => setRestoreResult(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag and Drop Zone */}
      {!fileMeta && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-8 md:p-12 text-center bg-card/30 backdrop-blur-xl hover:bg-card/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".hfk,.json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                Tarik & Lepaskan Berkas Backup di Sini
              </p>
              <p className="text-xs text-muted-foreground">
                atau klik untuk memilih dari komputer Anda (Format: <code className="text-primary font-mono font-bold">.hfk</code> / <code className="text-primary font-mono font-bold">.json</code>)
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-secondary text-secondary-foreground border border-border/40 group-hover:border-primary/40 transition-colors">
                <HardDrive className="w-3.5 h-3.5" /> Pilih Berkas Cadangan
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {(parseError || restoreError) && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block text-sm mb-0.5">Terjadi Kesalahan Restore:</span>
            {parseError || restoreError?.message}
          </div>
          {parseError && (
            <button
              onClick={() => {
                setParseError(null);
                setSelectedFile(null);
              }}
              className="text-rose-600 dark:text-rose-400 hover:opacity-80"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Selected File Preview Card */}
      {fileMeta && parsedPayload && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl shadow-xl space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm font-mono">{fileMeta.filename}</h4>
                <p className="text-xs text-muted-foreground font-mono">
                  Ukuran: {formatFileSize(fileMeta.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setParsedPayload(null);
                setFileMeta(null);
                setParseError(null);
              }}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
              title="Batal pilih file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/40 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground font-mono">
              <span>Integrasi SHA-256 Checksum:</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> Terverifikasi Valid
              </span>
            </div>
            <div className="p-2 rounded bg-background/80 font-mono text-[11px] text-muted-foreground break-all border border-border/30">
              {fileMeta.checksum}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedFile(null);
                setParsedPayload(null);
                setFileMeta(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all"
            >
              Pilih Berkas Lain
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Restore Data Sekarang
            </button>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal Dialog */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-outfit text-foreground">
                    Konfirmasi Restore Data
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tindakan ini berpengaruh langsung pada basis data hafalan aktif Anda.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>PERHATIAN PENTING:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                  <li>Seluruh data santri, kelas, hafalan & murajaah saat ini akan digantikan dengan data dari berkas backup.</li>
                  <li>Sistem akan secara otomatis membuat <strong>Backup Otomatis Pengaman</strong> dari keadaan saat ini sebelum proses restore dimulai.</li>
                  <li>Proses restore tidak dapat dibatalkan setelah dimulai.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  disabled={isRestoring}
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isRestoring}
                  onClick={handleExecuteRestore}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Restore...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" /> Ya, Jalankan Restore
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
