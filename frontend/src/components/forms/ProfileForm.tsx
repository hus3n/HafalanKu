'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, Lock, Building, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const user = useAuthStore((state) => state.user);
  const updateUserInStore = useAuthStore((state) => state.updateUser);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.put<any>('/users/profile', data);
      if (res.success) {
        updateUserInStore({
          name: data.name,
          phone: data.phone,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        throw new Error(res.message || 'Gagal memperbarui profil');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Feedback Banners */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Informasi profil Anda berhasil diperbarui!
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 text-xs font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-primary" /> Nama Lengkap <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Masukkan nama lengkap Anda..."
          {...register('name')}
          className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
        {errors.name && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Input (Readonly) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-primary" /> Alamat Email Utama
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-500" /> Email tidak dapat diubah
          </span>
        </label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full h-11 px-4 rounded-xl border border-input bg-muted/40 text-muted-foreground text-sm cursor-not-allowed font-mono"
        />
      </div>

      {/* Phone Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-primary" /> Nomor WhatsApp / HP
        </label>
        <input
          type="text"
          placeholder="contoh: 081234567890"
          {...register('phone')}
          className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
        />
      </div>

      {/* Readonly Organization & Role Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-3.5 rounded-xl border border-border bg-secondary space-y-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
            <Building className="w-3.5 h-3.5 text-primary" /> Lembaga / Organisasi
          </span>
          <span className="text-xs font-bold text-foreground block font-outfit">
            {user?.organization?.name || 'Perorangan'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary space-y-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
            <Shield className="w-3.5 h-3.5 text-primary" /> Role Akses System
          </span>
          <span className="text-xs font-bold text-foreground block font-outfit">
            {user?.role === 'SUPERADMIN'
              ? 'Superadmin'
              : user?.role === 'ADMIN'
              ? 'Admin Organisasi'
              : 'Pengajar / User'}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Simpan Profil
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
