'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createKelasSchema, CreateKelasInput } from 'shared';
import { motion } from 'motion/react';
import { Building, FileText, Loader2 } from 'lucide-react';

interface KelasFormProps {
  initialValues?: Partial<CreateKelasInput>;
  onSubmit: (data: CreateKelasInput) => void;
  isLoading?: boolean;
  submitText?: string;
}

export function KelasForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitText = 'Simpan Kelas',
}: KelasFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateKelasInput>({
    resolver: zodResolver(createKelasSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nama Kelas */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" />
          Nama Kelas / Kelompok
        </label>
        <input
          type="text"
          placeholder="e.g. Kelas Abu Bakar"
          {...register('name')}
          className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      {/* Deskripsi Kelas */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Deskripsi (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Catatan singkat tentang kelompok belajar ini..."
          {...register('description')}
          className="flex w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all resize-none"
        />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

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
