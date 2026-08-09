'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, CheckCircle2, Loader2, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { changePasswordSchema, ChangePasswordInput } from 'shared';
import { api } from '../../lib/api';

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post<any>('/auth/change-password', data);
      if (res.success) {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(res.message || 'Gagal mengubah password');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah password. Pastikan password lama sesuai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Feedback Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password Anda berhasil diperbarui!
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

      {/* Old Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-primary" /> Password Lama <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showOldPassword ? 'text' : 'password'}
            placeholder="Masukkan password Anda saat ini..."
            {...register('oldPassword')}
            className="w-full h-11 px-4 pr-10 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.oldPassword && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.oldPassword.message}
          </p>
        )}
      </div>

      {/* New Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" /> Password Baru <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Minimal 8 karakter..."
            {...register('newPassword')}
            className="w-full h-11 px-4 pr-10 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm New Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-primary" /> Konfirmasi Password Baru <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Ulangi password baru Anda..."
            {...register('confirmPassword')}
            className="w-full h-11 px-4 pr-10 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}
          </p>
        )}
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
              Mengubah Password...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Ubah Password
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
