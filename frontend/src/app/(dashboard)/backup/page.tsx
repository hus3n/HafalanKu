'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  DownloadCloud, 
  RotateCcw, 
  History, 
  Lock, 
  Send, 
  FileCheck, 
  Loader2,
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { useBackupHistory, useCreateBackup } from '../../../hooks/useBackup';
import { BackupHistory } from '../../../components/backup/BackupHistory';
import { RestoreUpload } from '../../../components/backup/RestoreUpload';

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'restore'>('history');
  const { data: logs = [], isLoading } = useBackupHistory();
  const { mutate: createBackup, isPending: isCreating, isSuccess, data: createdBackupData } = useCreateBackup();

  const handleCreateBackup = () => {
    createBackup();
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
          <HardDrive className="w-8 h-8 text-primary" />
          Backup & Restore Data
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Amankan seluruh data santri, kelas, dan hafalan dengan enkripsi AES-256-GCM atau pulihkan data dari berkas cadangan.
        </p>
      </div>

      {/* Hero Action Card */}
      <div className="p-6 md:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/80 to-accent/5 backdrop-blur-2xl shadow-xl shadow-primary/5 relative overflow-hidden">
        {/* Ambient Light effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/20">
              <Lock className="w-3.5 h-3.5" /> Enkripsi AES-256-GCM
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-outfit text-foreground">
              Pencadangan Data Otomatis & Aman
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Berkas backup dienkripsi dengan SHA-256 Checksum untuk integritas data penuh dan dikirim langsung ke Telegram Bot sebagai salinan cadangan cloud.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <ShieldCheck className="w-4 h-4" /> Integritas SHA-256
              </span>
              <span className="flex items-center gap-1.5 text-sky-500">
                <Send className="w-4 h-4" /> Telegram Cloud Sync
              </span>
              <span className="flex items-center gap-1.5 text-purple-500">
                <FileCheck className="w-4 h-4" /> Format .HFK
              </span>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isCreating}
              onClick={handleCreateBackup}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Membuat Backup...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-5 h-5" />
                  <span>Buat Backup Sekarang</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Success toast inside card */}
        {isSuccess && createdBackupData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 text-xs font-medium"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              Backup <code className="font-mono font-bold">{createdBackupData.filename}</code> berhasil diproses! Berkas cadangan otomatis terunduh ke perangkat Anda dan terkirim ke Telegram Bot.
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-border/40 gap-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === 'history'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Backup ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('restore')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === 'restore'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restore Data</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'history' ? (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BackupHistory logs={logs} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div
            key="restore-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RestoreUpload />
          </motion.div>
        )}
      </div>
    </div>
  );
}
