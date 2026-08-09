'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSantriSchema, CreateSantriInput } from 'shared';
import { useKelasList } from '../../hooks/useKelas';
import { motion } from 'motion/react';
import { User, Phone, UserCheck, Building, Loader2 } from 'lucide-react';

interface SantriFormProps {
  initialValues?: Partial<CreateSantriInput>;
  onSubmit: (data: CreateSantriInput) => void;
  isLoading?: boolean;
  submitText?: string;
}

export function SantriForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitText = 'Simpan Data Santri',
}: SantriFormProps) {
  const { data: kelasOptions = [] } = useKelasList();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSantriInput>({
    resolver: zodResolver(createSantriSchema),
    defaultValues: {
      name: initialValues?.name || '',
      parentName: initialValues?.parentName || '',
      parentPhone: initialValues?.parentPhone || '',
      kelasId: initialValues?.kelasId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nama Santri */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Nama Lengkap Santri
        </label>
        <input
          type="text"
          placeholder="e.g. Ahmad Fauzi"
          {...register('name')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      {/* Nama Orang Tua / Wali */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" />
          Nama Wali / Orang Tua
        </label>
        <input
          type="text"
          placeholder="e.g. Bpk. Hendra Fauzi"
          {...register('parentName')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
        />
        {errors.parentName && <p className="text-xs text-destructive mt-1">{errors.parentName.message}</p>}
      </div>

      {/* WhatsApp Wali */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          No. WhatsApp Wali (Terenkripsi AES-256)
        </label>
        <input
          type="text"
          placeholder="e.g. 628123456789"
          {...register('parentPhone')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
        />
        <p className="text-[11px] text-muted-foreground">Format internasional diawali dengan 62 (contoh: 628123456789)</p>
        {errors.parentPhone && <p className="text-xs text-destructive mt-1">{errors.parentPhone.message}</p>}
      </div>

      {/* Pilih Kelas */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          Kelas / Kelompok (Opsional)
        </label>
        <select
          {...register('kelasId')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
        >
          <option value="">-- Tanpa Kelas --</option>
          {kelasOptions.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        {errors.kelasId && <p className="text-xs text-destructive mt-1">{errors.kelasId.message}</p>}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <span>{submitText}</span>
        )}
      </motion.button>
    </form>
  );
}
