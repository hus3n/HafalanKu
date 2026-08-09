'use client';

import React, { useState } from 'react';
import { useNotificationHistory } from '../../../hooks/useNotification';
import { NotificationTable } from '../../../components/tables/NotificationTable';
import { ChevronLeft, ChevronRight, MessageSquare, Filter } from 'lucide-react';

export default function NotificationHistoryPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useNotificationHistory({ page, limit: 10, status, type });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-2">
          Riwayat Notifikasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Log pengiriman notifikasi WhatsApp ke wali murid santri.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Status Pengiriman</option>
            <option value="SENT">Terkirim (SENT)</option>
            <option value="FAILED">Gagal (FAILED)</option>
            <option value="PENDING">Pending (PENDING)</option>
          </select>
        </div>

        <div className="relative flex-1">
          <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Jenis Notifikasi</option>
            <option value="HAFALAN_NEW">Setoran Hafalan Baru</option>
            <option value="MURAJAAH_SCHEDULE">Jadwal Murajaah</option>
          </select>
        </div>
      </div>

      {/* Notification Table */}
      <NotificationTable logs={data?.logs || []} isLoading={isLoading} />

      {/* Pagination Controls */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{data.logs.length}</span> dari{' '}
            <span className="font-semibold text-foreground">{data.meta.total}</span> notifikasi
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
    </div>
  );
}
