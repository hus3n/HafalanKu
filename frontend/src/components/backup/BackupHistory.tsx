'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  RotateCcw, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  HardDrive, 
  Send,
  Calendar,
  FileCode
} from 'lucide-react';
import { BackupLogItem } from '../../hooks/useBackup';

interface BackupHistoryProps {
  logs: BackupLogItem[];
  isLoading: boolean;
}

export function BackupHistory({ logs, isLoading }: BackupHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChecksum(text);
    setTimeout(() => setCopiedChecksum(null), 2000);
  };

  const filteredLogs = logs.filter((log) =>
    log.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.checksum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama berkas atau checksum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="text-xs text-muted-foreground self-end sm:self-center">
          Total Berkas Cadangan: <span className="font-semibold text-foreground">{logs.length}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Berkas</th>
                <th className="py-3.5 px-4">Tanggal Backup</th>
                <th className="py-3.5 px-4">Ukuran</th>
                <th className="py-3.5 px-4">SHA-256 Checksum</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Integrasi Bot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-foreground">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-40 bg-muted/60 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-muted/60 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-muted/60 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 bg-muted/60 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-20 bg-muted/60 rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-5 w-16 bg-muted/60 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border/40">
                        <HardDrive className="w-8 h-8 opacity-60" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Belum ada riwayat backup</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Klik tombol &quot;Buat Backup Sekarang&quot; di atas untuk mencadangkan seluruh data hafalan santri.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log) => (
                    <motion.tr
                      key={log._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Filename */}
                      <td className="py-3.5 px-4 font-medium font-mono text-xs flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]" title={log.filename}>
                          {log.filename}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                        {formatFileSize(log.sizeBytes)}
                      </td>

                      {/* Checksum */}
                      <td className="py-3.5 px-4 text-xs">
                        <button
                          onClick={() => copyToClipboard(log.checksum)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/40 font-mono text-[11px] text-muted-foreground hover:text-foreground transition-all group/btn"
                          title="Klik untuk menyalin Checksum SHA-256"
                        >
                          <span>{log.checksum.substring(0, 12)}...</span>
                          {copiedChecksum === log.checksum ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.status === 'SUCCESS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Sukses
                          </span>
                        )}
                        {log.status === 'RESTORED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <RotateCcw className="w-3 h-3" />
                            Restored
                          </span>
                        )}
                        {log.status === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            Gagal
                          </span>
                        )}
                      </td>

                      {/* Telegram Integration */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {log.telegramSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-sky-500 font-medium bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                            <Send className="w-3 h-3" />
                            Telegram Bot
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground opacity-50">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
