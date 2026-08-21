'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHafalanSchema, CreateHafalanInput, surahList } from 'shared';
import { useSantriList } from '../../hooks/useSantri';
import { motion } from 'motion/react';
import { User, BookOpen, Award, Calendar, FileText, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HafalanFormProps {
  onSubmit?: (data: CreateHafalanInput) => void;
  onSubmitUpdate?: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
  preselectedSantriId?: string;
}

export function HafalanForm({ onSubmit, onSubmitUpdate, initialData, isLoading = false, preselectedSantriId }: HafalanFormProps) {
  const { data: santriData } = useSantriList({ limit: 100 });
  const santriOptions = santriData?.santri || [];

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateHafalanInput>({
    resolver: zodResolver(createHafalanSchema),
    defaultValues: initialData ? {
      santriId: initialData.santriId,
      surahNumber: initialData.surahNumber,
      ayatStart: initialData.ayatStart,
      ayatEnd: initialData.ayatEnd,
      predikat: initialData.predikat,
      date: new Date(initialData.date).toISOString().split('T')[0],
      notes: initialData.notes || '',
    } : {
      santriId: preselectedSantriId || '',
      surahNumber: 1,
      ayatStart: 1,
      ayatEnd: 7,
      predikat: 'MUMTAZ',
      date: todayStr,
      notes: '',
    },
  });

  const handleFormSubmit = (data: CreateHafalanInput) => {
    if (initialData && onSubmitUpdate) {
      onSubmitUpdate(data);
    } else if (onSubmit) {
      onSubmit(data);
    }
  };

  const selectedSurahNumber = watch('surahNumber');
  const selectedPredikat = watch('predikat');
  const selectedSurah = surahList.find((s) => s.number === Number(selectedSurahNumber));

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = Number(e.target.value);
    setValue('surahNumber', num);
    const s = surahList.find((item) => item.number === num);
    if (s) {
      setValue('ayatStart', 1);
      setValue('ayatEnd', s.numberOfAyah);
    }
  };

  const predikatList: Array<{
    value: 'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'MAQBUL' | 'ULANG';
    label: string;
    description: string;
    badgeColor: string;
  }> = [
    { value: 'MUMTAZ', label: 'Mumtaz (Mumtaz)', description: 'Lancar tanpa salah', badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    { value: 'JAYYID_JIDDAN', label: 'Jayyid Jiddan', description: 'Sangat baik (1-2 salah)', badgeColor: 'bg-[#0E8991]/15 text-[#0E8991] dark:text-[#1bb2bd] border-[#0E8991]/30' },
    { value: 'JAYYID', label: 'Jayyid', description: 'Baik (3-4 salah)', badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30' },
    { value: 'MAQBUL', label: 'Maqbul', description: 'Cukup (5+ salah)', badgeColor: 'bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border-[#EAA27C]/30' },
    { value: 'ULANG', label: 'Ulang', description: 'Wajib diulang kembali', badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Pilih Santri */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Pilih Santri
        </label>
        <select
          {...register('santriId')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        >
          <option value="">-- Pilih Santri --</option>
          {santriOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.kelas ? `(${s.kelas.name})` : ''}
            </option>
          ))}
        </select>
        {errors.santriId && <p className="text-xs text-destructive mt-1">{errors.santriId.message}</p>}
      </div>

      {/* Pilih Surat & Ayat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropdown Surat */}
        <div className="space-y-2 md:col-span-1">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Nama Surat
          </label>
          <select
            value={selectedSurahNumber}
            onChange={handleSurahChange}
            className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          >
            {surahList.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.latinName} ({s.numberOfAyah} ayat)
              </option>
            ))}
          </select>
        </div>

        {/* Ayat Mulai */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Ayat Mulai</label>
          <input
            type="number"
            min={1}
            max={selectedSurah?.numberOfAyah || 286}
            {...register('ayatStart', { valueAsNumber: true })}
            className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          {errors.ayatStart && <p className="text-xs text-destructive mt-1">{errors.ayatStart.message}</p>}
        </div>

        {/* Ayat Selesai */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Ayat Selesai</label>
          <input
            type="number"
            min={1}
            max={selectedSurah?.numberOfAyah || 286}
            {...register('ayatEnd', { valueAsNumber: true })}
            className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          {errors.ayatEnd && <p className="text-xs text-destructive mt-1">{errors.ayatEnd.message}</p>}
        </div>
      </div>

      {/* Predikat Penilaian */}
      <div className="space-y-3">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          Predikat Penilaian Setoran
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {predikatList.map((p) => {
            const isChecked = selectedPredikat === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setValue('predikat', p.value)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden',
                  isChecked
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-border/50 bg-background/30 hover:bg-secondary/40'
                )}
              >
                <div>
                  <span className={cn('inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold border mb-1.5', p.badgeColor)}>
                    {p.value}
                  </span>
                  <p className="text-xs font-bold text-foreground">{p.label}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{p.description}</p>
              </button>
            );
          })}
        </div>
        {errors.predikat && <p className="text-xs text-destructive mt-1">{errors.predikat.message}</p>}
      </div>

      {/* Tanggal Setoran */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Tanggal Setoran
        </label>
        <input
          type="date"
          {...register('date')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
        {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
      </div>

      {/* Catatan / Evaluasi */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Catatan / Evaluasi Pengajar (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Catatan khusus mengenai tajwid, makhraj, atau kelancaran..."
          {...register('notes')}
          className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all resize-none"
        />
        {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/25 hover:opacity-90 transition-all mt-8"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Menyimpan Setoran...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>{initialData ? 'Simpan Perubahan' : 'Simpan Setoran Hafalan'}</span>
          </>
        )}
      </motion.button>
    </form>
  );
}
