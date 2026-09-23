'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { RegisterInput, registerSchema } from 'shared';
import { api } from '../../lib/api';
import { useLandingAuth } from '../../contexts/LandingAuthContext';
import Link from 'next/link';
import { User } from 'shared';
import { cn } from '../../lib/utils';
import { EmailOtpVerificationModal } from '../modals/EmailOtpVerificationModal';
import { GoogleAuthButton } from '../shared/GoogleAuthButton';

export function RegisterForm() {
  const router = useRouter();
  const { authMode, setAuthMode } = useLandingAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingRegistrationData, setPendingRegistrationData] = useState<RegisterInput | null>(null);

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
      subscriptionPlan: 'TRIAL_14_DAYS',
    },
  });

  const accountType = watch('accountType');
  const organizationName = watch('organizationName');
  const phone = watch('phone');
  const selectedPlan = watch('subscriptionPlan') || 'TRIAL_14_DAYS';

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post<{
        user: User;
        message?: string;
        requiresEmailVerification?: boolean;
        email?: string;
      }>('/auth/register', data);
      return { res, originalData: data };
    },
    onSuccess: ({ res, originalData }) => {
      if (res.success && res.data) {
        setPendingRegistrationData(originalData);
        setOtpEmail(originalData.email);
        setShowOtpModal(true);
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
    setSuccessMsg(null);
    registerMutation.mutate(data);
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    setIsSuccess(true);

    if (pendingRegistrationData) {
      const waNumber = '6285229925593';
      const isOrg = pendingRegistrationData.accountType === 'organization';
      let planText = 'Trial Gratis (14 Hari)';
      if (pendingRegistrationData.subscriptionPlan === '1_MONTH') {
        planText = isOrg ? 'Paket Organisasi 1 Bulan (Rp 55.000)' : 'Paket Pribadi 1 Bulan (Rp 15.000)';
      } else if (pendingRegistrationData.subscriptionPlan === '6_MONTHS') {
        planText = isOrg ? 'Paket Organisasi 6 Bulan (Rp 300.000)' : 'Paket Pribadi 6 Bulan (Rp 85.000)';
      } else if (pendingRegistrationData.subscriptionPlan === '12_MONTHS' || pendingRegistrationData.subscriptionPlan === '1_YEAR') {
        planText = isOrg ? 'Paket Organisasi 1 Tahun (Rp 550.000)' : 'Paket Pribadi 1 Tahun (Rp 165.000)';
      } else if (pendingRegistrationData.subscriptionPlan === 'ENTERPRISE') {
        planText = 'Paket Enterprise (Rp 500.000 / bulan)';
      } else if (pendingRegistrationData.subscriptionPlan === 'LIFETIME') {
        planText = 'Paket Lifetime / Permanen';
      }

      const waText = `Assalamu'alaikum Admin,\n\nSaya telah mendaftar dan memverifikasi email akun HafalanKu saya:\n\nNama: ${pendingRegistrationData.name}\nEmail: ${pendingRegistrationData.email}\nNo. WhatsApp: ${pendingRegistrationData.phone}\nTipe Akun: ${isOrg ? 'Admin Organisasi' : 'Pengajar/User'}\nPilihan Paket: ${planText}\n\nMohon untuk segera diaktifkan. Terima kasih.`;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      try {
        window.open(waUrl, '_blank');
      } catch {}
    }

    setTimeout(() => {
      router.push('/login?pending=true');
    }, 1200);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="glass-card p-6 sm:p-8 w-full max-w-md mx-auto border border-primary/20"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-outfit text-gradient">Buat Akun</h1>
          <p className="text-muted-foreground mt-1.5 text-xs">Bergabunglah dengan HafalanKu</p>
        </div>

        {/* Google Sign-In Button */}
        <div className="space-y-4 mb-5">
          <GoogleAuthButton
            mode="register"
            accountType={accountType}
            organizationName={organizationName}
            phone={phone}
            subscriptionPlan={selectedPlan}
            onError={(msg) => setErrorMsg(msg)}
            onSuccessMessage={(msg) => setSuccessMsg(msg)}
          />

          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-border/40" />
            <span className="absolute bg-[#0C313A] px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider rounded-md">
              atau daftar manual
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
          </AnimatePresence>

          {/* Account Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex bg-muted/50 p-1 rounded-xl relative overflow-hidden border border-border/40"
          >
            <button
              type="button"
              onClick={() => setValue('accountType', 'personal')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all z-10 cursor-pointer',
                accountType === 'personal'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Perorangan
            </button>
            <button
              type="button"
              onClick={() => setValue('accountType', 'organization')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all z-10 cursor-pointer',
                accountType === 'organization'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Lembaga / TPQ
            </button>
          </motion.div>

          {/* Organization Name Field (Conditional) */}
          <AnimatePresence>
            {accountType === 'organization' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-xs font-medium text-foreground">Nama Lembaga / TPQ</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    {...register('organizationName')}
                    placeholder="Contoh: TPQ Al-Ikhlas"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-[11px] text-destructive">{errors.organizationName.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Nama Lengkap</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                {...register('name')}
                placeholder="Nama Lengkap Anda"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                {...register('email')}
                type="email"
                placeholder="email@domain.com"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </motion.div>

          {/* WhatsApp / Phone Field */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Nomor WhatsApp / HP</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-[#0E8991]" />
              <input
                {...register('phone')}
                type="tel"
                inputMode="numeric"
                placeholder="Contoh: 08123456789"
                className="w-full pl-9 pr-4 py-2 text-xs font-mono rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-destructive">{errors.phone.message}</p>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1.5"
          >
            <label className="text-xs font-medium text-foreground">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Pilihan Paket Masa Aktif / Trial */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.33 }}
            className="space-y-2 pt-1"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EAA27C]" />
                Pilihan Masa Aktif
              </label>
              <span className="text-[10px] text-muted-foreground">Pilih paket awal</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue('subscriptionPlan', 'TRIAL_14_DAYS')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden',
                  selectedPlan === 'TRIAL_14_DAYS'
                    ? 'border-[#0E8991] bg-[#0E8991]/15 text-foreground ring-1 ring-[#0E8991]'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-foreground">🎁 Trial Gratis</span>
                  {selectedPlan === 'TRIAL_14_DAYS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8991]" />}
                </div>
                <p className="text-[10px] text-muted-foreground">14 Hari Penuh Fitur</p>
              </button>

              <button
                type="button"
                onClick={() => setValue('subscriptionPlan', '1_MONTH')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden',
                  selectedPlan === '1_MONTH'
                    ? 'border-[#0E8991] bg-[#0E8991]/15 text-foreground ring-1 ring-[#0E8991]'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-foreground">💎 1 Bulan</span>
                  {selectedPlan === '1_MONTH' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8991]" />}
                </div>
                <p className="text-[10px] font-semibold text-foreground/80">
                  {accountType === 'organization' ? 'Rp 55k / bulan' : 'Rp 15k / bulan'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue('subscriptionPlan', '6_MONTHS')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden',
                  selectedPlan === '6_MONTHS'
                    ? 'border-[#0E8991] bg-[#0E8991]/15 text-foreground ring-1 ring-[#0E8991]'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-foreground">💎 6 Bulan</span>
                  {selectedPlan === '6_MONTHS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8991]" />}
                </div>
                <p className="text-[10px] text-[#EAA27C] font-semibold">
                  {accountType === 'organization' ? 'Rp 300k (Hemat)' : 'Rp 85k (Hemat)'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue('subscriptionPlan', '12_MONTHS')}
                className={cn(
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden',
                  selectedPlan === '12_MONTHS'
                    ? 'border-[#0E8991] bg-[#0E8991]/15 text-foreground ring-1 ring-[#0E8991]'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-foreground">💎 1 Tahun</span>
                  {selectedPlan === '12_MONTHS' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8991]" />}
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {accountType === 'organization' ? 'Rp 550k (Paling Hemat)' : 'Rp 165k (Paling Hemat)'}
                </p>
              </button>
            </div>

            {accountType === 'organization' && (
              <button
                type="button"
                onClick={() => setValue('subscriptionPlan', 'ENTERPRISE')}
                className={cn(
                  'w-full p-2.5 mt-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between',
                  selectedPlan === 'ENTERPRISE'
                    ? 'border-[#0E8991] bg-[#0E8991]/15 text-foreground ring-1 ring-[#0E8991]'
                    : 'border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">🏢 Enterprise Multi-Cabang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#EAA27C]">Rp 500k<span className="text-[10px] font-normal text-muted-foreground">/bln</span></span>
                  {selectedPlan === 'ENTERPRISE' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0E8991]" />}
                </div>
              </button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={isSuccess ? { scale: [1, 1.05, 1] } : {}}
              type="submit"
              disabled={registerMutation.isPending || isSuccess}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#0E8991] hover:bg-[#0C737A] text-white shadow-lg shadow-[#0E8991]/25 h-11 px-4 py-2 w-full mt-4 cursor-pointer"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : isSuccess ? (
                'Pendaftaran Berhasil!'
              ) : (
                'Daftar Sekarang'
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
          Sudah punya akun?{' '}
          {authMode ? (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="font-semibold text-[#0E8991] dark:text-[#1bb2bd] hover:underline transition-colors cursor-pointer"
            >
              Masuk di sini
            </button>
          ) : (
            <Link href="/login" className="font-semibold text-primary hover:underline transition-colors">
              Masuk di sini
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
