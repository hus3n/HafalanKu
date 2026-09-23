'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useHafalanList } from '../../hooks/useHafalan';
import { useCreateMurajaah } from '../../hooks/useMurajaah';

interface SantriOption {
  id: string;
  name: string;
  kelas?: {
    id?: string;
    name: string;
  } | null;
}

interface MurajaahManualFormProps {
  allowedSantri: SantriOption[];
}

export function MurajaahManualForm({ allowedSantri }: MurajaahManualFormProps) {
  const [formSantriId, setFormSantriId] = useState('');
  const [formSurahNumber, setFormSurahNumber] = useState('');
  const [formAyatRange, setFormAyatRange] = useState('');

  const { data: formHafalanData } = useHafalanList(
    formSantriId ? { santriId: formSantriId, limit: 114 } : { santriId: 'none' }
  );

  const formSurahOptions = useMemo(() => {
    if (!formHafalanData?.hafalan) return [];
    const map = new Map();
    for (const h of formHafalanData.hafalan) {
      if (!map.has(h.surahNumber)) map.set(h.surahNumber, h);
    }
    return Array.from(map.values()).sort((a, b) => a.surahNumber - b.surahNumber);
  }, [formHafalanData]);

  const createMurajaahMutation = useCreateMurajaah();

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSantriId || !formSurahNumber) return;

    const selectedSurah = formSurahOptions.find(
      (s) => s.surahNumber.toString() === formSurahNumber
    );
    if (!selectedSurah) return;

    try {
      await createMurajaahMutation.mutateAsync({
        santriId: formSantriId,
        surahNumber: selectedSurah.surahNumber,
        surahName: selectedSurah.surahName,
        ayatRange: formAyatRange || undefined,
      });

      setFormSantriId('');
      setFormSurahNumber('');
      setFormAyatRange('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan jadwal.';
      alert(message);
    }
  };

  return (
    <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-md">
      <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-4">
        <Plus className="w-5 h-5" />
        <span>Tambah Jadwal Murajaah Hari Ini</span>
      </div>

      <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Pilih Santri</label>
          <select
            value={formSantriId}
            onChange={(e) => {
              setFormSantriId(e.target.value);
              setFormSurahNumber('');
            }}
            required
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer font-medium"
          >
            <option value="">-- Pilih Santri --</option>
            {allowedSantri.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.kelas?.name ? `(${s.kelas.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Pilih Surah (Dari Hafalan Santri)</label>
          <select
            value={formSurahNumber}
            onChange={(e) => setFormSurahNumber(e.target.value)}
            required
            disabled={!formSantriId}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer font-medium disabled:opacity-50"
          >
            <option value="">-- Pilih Surah --</option>
            {formSurahOptions.map((s) => (
              <option key={s.surahNumber} value={s.surahNumber}>
                #{s.surahNumber} {s.surahName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Rentang Ayat (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: 1-155"
            value={formAyatRange}
            onChange={(e) => setFormAyatRange(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all font-medium"
          />
        </div>

        <div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={createMurajaahMutation.isPending || !formSantriId || !formSurahNumber}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {createMurajaahMutation.isPending ? 'Menambahkan...' : 'Tambah ke Jadwal'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
