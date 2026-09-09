'use client';

import React, { useState } from 'react';
import { surahList } from 'shared';
import { useSantriList } from '../../hooks/useSantri';
import { motion, AnimatePresence } from 'motion/react';
import { User, BookOpen, Award, Calendar, FileText, Loader2, Sparkles, Trash2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MultiSelectSurah } from './MultiSelectSurah';

interface MurajaahRecordData {
  surahNumber: number;
  ayatStart: number;
  ayatEnd: number;
  type: string;
}

interface MurajaahSubmitData {
  santriId: string;
  date: string;
  predikat: string;
  notes?: string;
  records: Array<{
    surahNumber: number;
    ayatStart: number;
    ayatEnd: number;
    type: string;
    notes?: string;
  }>;
}

interface MurajaahHafalanFormProps {
  onSubmit: (data: MurajaahSubmitData) => void;
  isLoading?: boolean;
}

export function MurajaahHafalanForm({ onSubmit, isLoading = false }: MurajaahHafalanFormProps) {
  const { data: santriData } = useSantriList({ limit: 100 });
  const santriOptions = santriData?.santri || [];
  
  const todayStr = new Date().toISOString().split('T')[0];

  const [santriId, setSantriId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [predikat, setPredikat] = useState('MUMTAZ');
  const [notes, setNotes] = useState('');
  
  const [surahs, setSurahs] = useState<number[]>([]);
  // Store custom ranges
  const [ranges, setRanges] = useState<Record<number, {start: number, end: number}>>({});

  const handleSurahsChange = (selected: number[]) => {
    setSurahs(selected);
    const newRanges = { ...ranges };
    selected.forEach(num => {
      if (!newRanges[num]) {
        const surah = surahList.find(s => s.number === num);
        if (surah) {
          newRanges[num] = { start: 1, end: surah.numberOfAyah };
        }
      }
    });
    setRanges(newRanges);
  };

  const handleRangeChange = (surahNumber: number, field: 'start'|'end', val: number) => {
    setRanges(prev => ({
      ...prev,
      [surahNumber]: {
        ...prev[surahNumber],
        [field]: val,
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!santriId) return alert('Pilih santri!');
    if (surahs.length === 0) return alert('Pilih minimal 1 surat!');

    const records = surahs.map(num => ({
      surahNumber: num,
      ayatStart: ranges[num]?.start || 1,
      ayatEnd: ranges[num]?.end || 7,
      type: 'MURAJAAH'
    }));

    onSubmit({
      santriId,
      date,
      predikat,
      notes,
      records
    });
  };

  const predikatList = [
    { value: 'MUMTAZ', label: 'Mumtaz', description: 'Lancar tanpa salah', badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    { value: 'JAYYID_JIDDAN', label: 'Jayyid Jiddan', description: 'Sangat baik', badgeColor: 'bg-[#0E8991]/15 text-[#0E8991] dark:text-[#1bb2bd] border-[#0E8991]/30' },
    { value: 'JAYYID', label: 'Jayyid', description: 'Baik', badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
    { value: 'MAQBUL', label: 'Maqbul', description: 'Cukup', badgeColor: 'bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border-[#EAA27C]/30' },
    { value: 'ULANG', label: 'Ulang', description: 'Wajib diulang', badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Pilih Santri
        </label>
        <select
          required
          value={santriId}
          onChange={(e) => setSantriId(e.target.value)}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">-- Pilih Santri --</option>
          {santriOptions.map(s => (
            <option key={s.id} value={s.id}>{s.name} {s.kelas ? `(${s.kelas.name})` : ''}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Surat yang di-Murajaah
        </label>
        <MultiSelectSurah selectedSurahs={surahs} onChange={handleSurahsChange} />
      </div>

      {surahs.length > 0 && (
        <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Detail Rentang Ayat per Surat</h4>
          <div className="space-y-3">
            {surahs.map(num => {
              const surah = surahList.find(s => s.number === num);
              if (!surah) return null;
              return (
                <div key={num} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-card rounded-lg border border-border shadow-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{surah.number}. {surah.latinName}</p>
                    <p className="text-[10px] text-muted-foreground">Maksimal {surah.numberOfAyah} Ayat</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground mb-1">Mulai</span>
                      <input 
                        type="number" min={1} max={surah.numberOfAyah} 
                        value={ranges[num]?.start || 1}
                        onChange={(e) => handleRangeChange(num, 'start', parseInt(e.target.value))}
                        className="w-16 h-8 text-center rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <span>-</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground mb-1">Selesai</span>
                      <input 
                        type="number" min={1} max={surah.numberOfAyah} 
                        value={ranges[num]?.end || surah.numberOfAyah}
                        onChange={(e) => handleRangeChange(num, 'end', parseInt(e.target.value))}
                        className="w-16 h-8 text-center rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Predikat */}
      <div className="space-y-3">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Predikat Penilaian Setoran (Berlaku untuk semua)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {predikatList.map((p) => {
            const isChecked = predikat === p.value;
            return (
              <button
                key={p.value} type="button" onClick={() => setPredikat(p.value)}
                className={cn('p-3 rounded-xl border text-left transition-all', isChecked ? 'border-primary bg-primary/10' : 'border-border/50 bg-background/30 hover:bg-secondary/40')}
              >
                <div>
                  <span className={cn('inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border mb-1.5', p.badgeColor)}>{p.value}</span>
                  <p className="text-xs font-bold text-foreground">{p.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Tanggal Setoran</label>
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Catatan Tambahan (Opsional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm resize-none" />
      </div>

      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-8">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /><span>Simpan Murajaah Massal</span></>}
      </button>
    </form>
  );
}
