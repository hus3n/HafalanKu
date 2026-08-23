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
import { GoogleAuthButton } from '../shared/GoogleAuthButton';
import { EmailOtpVerificationModal } from '../modals/EmailOtpVerificationModal';

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const { authMode, setAuthMode } = useLandingAuth();
  const searchParams = useSearchParams();
  const isPending = searchParams.get('pending') === 'true';

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');

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
      const errorText = error.message || 'Gagal masuk. Silakan periksa kembali kredensial Anda.';
      if (errorText.toLowerCase().includes('belum diverifikasi') || errorText.toLowerCase().includes('verifikasi email')) {
        setOtpEmail(emailValue || '');
        setShowOtpModal(true);
      } else {
        setErrorMsg(errorText);
      }
    },
  });

  const onSubmit = (data: LoginInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    loginMutation.mutate(data);
  };

  const handleOtpSuccess = (data: any) => {
    setShowOtpModal(false);
    setSuccessMsg('Email Anda berhasil diverifikasi! Silakan tunggu konfirmasi aktivasi dari Admin.');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="glass-card p-8 w-full max-w-md mx-auto border border-primary/20"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-outfit text-gradient">Selamat Datang</h1>
          <p className="text-muted-foreground mt-1.5 text-xs">Masuk ke akun HafalanKu Anda</p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-4 mb-5">
          <GoogleAuthButton
            mode="login"
            onError={(msg) => setErrorMsg(msg)}
            onSuccessMessage={(msg) => setSuccessMsg(msg)}
          />

          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-border/40" />
            <span className="absolute bg-[#0C313A] px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider rounded-md">
              atau masuk dengan email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 text-xs text-destructive-foreground bg-destructive/90 rounded-xl border border-destructive/20 text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 rounded-xl border border-emerald-500/30 text-center"
              >
                {successMsg}
              </motion.div>
            )}

            {isPending && !errorMsg && !successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 text-xs text-[#0E8991] bg-[#0E8991]/10 rounded-xl border border-[#0E8991]/20 text-center"
              >
                Pendaftaran berhasil! Akun Anda sedang dalam proses verifikasi dan aktivasi oleh Superadmin.
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                {...register('email')}
                type="email"
                placeholder="email@anda.com"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Kata sandi Anda"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
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
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#0E8991] hover:bg-[#0C737A] text-white shadow-lg shadow-[#0E8991]/25 h-11 px-4 py-2 w-full mt-4 cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : isSuccess ? (
                'Berhasil Masuk!'
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
              className="font-bold text-[#0E8991] dark:text-[#1bb2bd] hover:underline transition-colors cursor-pointer"
            >
              Daftar Sekarang
            </button>
          ) : (
            <Link href="/register" className="font-bold text-[#0E8991] dark:text-[#1bb2bd] hover:underline transition-colors">
              Daftar Sekarang
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Email OTP Verification Modal */}
      <EmailOtpVerificationModal
        isOpen={showOtpModal}
        email={otpEmail}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />
    </>
  );
}
