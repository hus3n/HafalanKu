'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationLogItem } from '../../hooks/useNotification';
import { CheckCircle2, XCircle, Clock, MessageSquare, Phone, User, Eye, X } from 'lucide-react';

interface NotificationTableProps {
  logs: NotificationLogItem[];
  isLoading?: boolean;
}

export function NotificationTable({ logs, isLoading }: NotificationTableProps) {
  const [viewingLog, setViewingLog] = useState<NotificationLogItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl glass animate-pulse" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="text-base font-bold font-outfit text-foreground">Belum Ada Riwayat Notifikasi</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto font-medium">
          Belum ada notifikasi WhatsApp terkirim atau filter pencarian tidak menemukan hasil.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Terkirim
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Gagal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border border-[#EAA27C]/30">
            <Clock className="w-3 h-3 text-[#B85828] dark:text-[#EAA27C]" /> Memproses
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HAFALAN_NEW':
        return <span className="text-xs font-bold text-primary">Setoran Hafalan Baru</span>;
      case 'MURAJAAH_SCHEDULE':
        return <span className="text-xs font-bold text-[#C46838] dark:text-[#EAA27C]">Jadwal Murajaah</span>;
      case 'SYSTEM_ALERT':
        return <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Info Sistem</span>;
      case 'REGISTRATION':
        return <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Pendaftaran</span>;
      default:
        return <span className="text-xs font-bold text-muted-foreground">{type}</span>;
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-4 px-6">Penerima</th>
              <th className="py-4 px-6">Jenis Notifikasi</th>
              <th className="py-4 px-6">Ringkasan Pesan</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Waktu Terkirim</th>
              <th className="py-4 px-6 text-right">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-sm">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.tr
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-foreground">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{log.recipientName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{log.recipientPhone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getTypeLabel(log.type)}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground max-w-xs truncate font-medium">
                    {log.message}
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(log.status)}</td>
                  <td className="py-4 px-6 text-xs text-muted-foreground whitespace-nowrap font-medium">
                    {new Date(log.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setViewingLog(log)}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      title="Lihat Isi Pesan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3.5">
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="p-5 rounded-3xl bg-card dark:bg-[#0C313A] border border-border dark:border-[#0E8991]/20 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{log.recipientName}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{log.recipientPhone}</p>
                </div>
                {getStatusBadge(log.status)}
              </div>

              <div>{getTypeLabel(log.type)}</div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>{new Date(log.createdAt).toLocaleDateString('id-ID')}</span>
                <button
                  onClick={() => setViewingLog(log)}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Lihat Pesan
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Message Modal */}
      <AnimatePresence>
        {viewingLog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingLog(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="p-6 rounded-3xl bg-card dark:bg-[#0C313A] max-w-lg w-full border border-border dark:border-[#0E8991]/30 shadow-2xl pointer-events-auto space-y-4 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-base font-bold font-outfit text-foreground">
                    Detail Pesan Notifikasi
                  </h3>
                  <button
                    onClick={() => setViewingLog(null)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Penerima:</span> {viewingLog.recipientName} ({viewingLog.recipientPhone})</p>
                  <p><span className="font-semibold text-foreground">Status:</span> {viewingLog.status} (Percobaan: {viewingLog.retryCount}x)</p>
                  {viewingLog.errorMessage && (
                    <p className="text-destructive"><span className="font-semibold">Error:</span> {viewingLog.errorMessage}</p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-background/60 border border-input text-xs font-sans whitespace-pre-wrap leading-relaxed">
                  {viewingLog.message}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
