'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { LoginInput, loginSchema } from 'shared';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useLandingAuth } from '../../contexts/LandingAuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { User } from 'shared';

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const { authMode, setAuthMode } = useLandingAuth();
  const searchParams = useSearchParams();
  const isPending = searchParams.get('pending') === 'true';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post<{ user: User; token: string; refreshToken: string }>('/auth/login', data);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Kombinasi email atau kata sandi tidak valid.');
      }
      return res.data;
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setAuth(data.user, data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Gagal masuk. Silakan periksa kembali kredensial Anda.');
    },
  });

  const onSubmit = (data: LoginInput) => {
    setErrorMsg(null);
    loginMutation.mutate(data);
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
        <h1 className="text-3xl font-bold font-outfit text-gradient">Selamat Datang</h1>
        <p className="text-muted-foreground mt-2 text-sm">Masuk ke akun HafalanKu Anda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          {isPending && !errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 text-sm text-emerald-700 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-center"
            >
              Pendaftaran berhasil! Akun Anda sedang diverifikasi. Silakan hubungi Admin via WhatsApp.
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="nama@email.com"
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 transition-colors"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 pr-10 transition-colors"
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
            disabled={loginMutation.isPending || isSuccess}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 h-11 px-4 py-2 w-full mt-4 cursor-pointer"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : isSuccess ? (
              'Berhasil!'
            ) : (
              'Masuk Akun'
            )}
          </motion.button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-xs text-muted-foreground"
      >
        Belum punya akun?{' '}
        {authMode ? (
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
          >
            Daftar Sekarang
          </button>
        ) : (
          <Link href="/register" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors">
            Daftar Sekarang
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
