'use client';

import React from 'react';
import { Filter, Building2, Users, Search, CheckSquare, Square } from 'lucide-react';

interface KelasOption {
  id: string;
  name: string;
  description?: string | null;
  totalSantri?: number;
}

interface SantriOption {
  id: string;
  name: string;
  kelas?: {
    id?: string;
    name: string;
  } | null;
}

interface MurajaahFilterBarProps {
  allKelasList: KelasOption[];
  allowedSantri: SantriOption[];
  selectedKelasId: string;
  selectedSantriId: string;
  searchQuery: string;
  onSelectKelas: (kelasId: string) => void;
  onSelectSantri: (santriId: string) => void;
  onSearchChange: (query: string) => void;
  totalSchedules: number;
  selectedSantriCount: number;
  onSelectAllSantri: () => void;
}

export function MurajaahFilterBar({
  allKelasList,
  allowedSantri,
  selectedKelasId,
  selectedSantriId,
  searchQuery,
  onSelectKelas,
  onSelectSantri,
  onSearchChange,
  totalSchedules,
  selectedSantriCount,
  onSelectAllSantri,
}: MurajaahFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Filter Kelompok Ustadz & Pilih Santri */}
      <div className="p-5 rounded-3xl border border-border bg-card shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter Tampilan Jadwal & Riwayat:</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kelompok / Kelas Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Kelompok Bimbingan
            </label>
            <select
              value={selectedKelasId}
              onChange={(e) => onSelectKelas(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
            >
              <option value="">-- Semua Kelompok ({allKelasList.length} Kelas) --</option>
              {allKelasList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} {k.description ? `(${k.description})` : ''} {k.totalSantri !== undefined ? `• ${k.totalSantri} Santri` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Santri Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Pilih Santri
            </label>
            <select
              value={selectedSantriId}
              onChange={(e) => onSelectSantri(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
            >
              <option value="">-- Semua Santri ({allowedSantri.length} Santri) --</option>
              {allowedSantri.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.kelas?.name ? `(${s.kelas.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Surah Quick Search & Bulk Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama santri atau surah hafalan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>
        {totalSchedules > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSelectAllSantri}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer shadow-sm"
            >
              {selectedSantriCount === totalSchedules ? (
                <>
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Batal Pilih Semua</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <span>Tandai Semua ({totalSchedules} Santri)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
