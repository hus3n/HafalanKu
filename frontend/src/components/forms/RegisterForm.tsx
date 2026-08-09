'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Lock, Mail, User as UserIcon, Building2, Eye, EyeOff, Phone } from 'lucide-react';
import { RegisterInput, registerSchema } from 'shared';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { User } from 'shared';
import { cn } from '../../lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'personal',
    },
  });

  const accountType = watch('accountType');

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      // Perhatikan token dan refreshToken dihapus dari response yang diharapkan
      const res = await api.post<{ user: User; message?: string }>('/auth/register', data);
      return { res, originalData: data };
    },
    onSuccess: ({ res, originalData }) => {
      if (res.success && res.data) {
        setIsSuccess(true);
        // Susun pesan WhatsApp
        const waNumber = '6285229925593';
        const waText = `Assalamu'alaikum Admin,\n\nSaya ingin mengaktifkan akun HafalanKu saya dengan detail berikut:\n\nNama: ${originalData.name}\nEmail: ${originalData.email}\nTipe Akun: ${originalData.accountType === 'organization' ? 'Admin Organisasi' : 'Pengajar/User'}\n\nMohon untuk segera diaktifkan. Terima kasih.`;
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
        
        // Buka WA di tab baru
        window.open(waUrl, '_blank');

        // Arahkan kembali ke halaman login
        setTimeout(() => {
          router.push('/login?pending=true');
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Gagal mendaftar. Silakan coba lagi.');
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Terjadi kesalahan pada server.');
    },
  });

  const onSubmit = (data: RegisterInput) => {
    setErrorMsg(null);
    registerMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className="glass-card p-8 w-full max-w-md mx-auto border border-primary/20"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-outfit text-gradient">Buat Akun</h1>
        <p className="text-muted-foreground mt-2 text-sm">Bergabunglah dengan HafalanKu</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md border border-destructive/20 text-center"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Type Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex bg-muted/50 p-1 rounded-lg relative overflow-hidden"
        >
          <motion.div
            className="absolute top-1 bottom-1 left-1 bg-background rounded-md shadow-sm border border-border"
            initial={false}
            animate={{
              width: 'calc(50% - 4px)',
              x: accountType === 'personal' ? 0 : '100%',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
          <button
            type="button"
            onClick={() => setValue('accountType', 'personal')}
            className={cn(
              "relative z-10 flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              accountType === 'personal' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserIcon className="w-4 h-4" />
            Perorangan
          </button>
          <button
            type="button"
            onClick={() => setValue('accountType', 'organization')}
            className={cn(
              "relative z-10 flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              accountType === 'organization' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2 className="w-4 h-4" />
            Organisasi
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none">Nama Lengkap</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Fulan bin Fulan"
              {...register('name')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 transition-colors"
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </motion.div>

        <AnimatePresence>
          {accountType === 'organization' && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="space-y-2"
            >
              <label className="text-sm font-medium leading-none">Nama Instansi / TPA</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="TPA Al-Bina"
                  {...register('organizationName')}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 transition-colors"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Nama organisasi tidak dapat diubah setelah pendaftaran</p>
              {errors.organizationName && <p className="text-xs text-destructive">{errors.organizationName.message}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="nama@email.com"
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 transition-colors"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none">Nomor WhatsApp / HP <span className="text-rose-500">*</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="081234567890"
              {...register('phone')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 transition-colors"
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 pr-10 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isSuccess ? { scale: [1, 1.05, 1] } : {}}
            type="submit"
            disabled={registerMutation.isPending || isSuccess}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-6"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : isSuccess ? (
              'Berhasil!'
            ) : (
              'Daftar'
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
          Masuk di sini
        </Link>
      </motion.div>
    </motion.div>
  );
}
