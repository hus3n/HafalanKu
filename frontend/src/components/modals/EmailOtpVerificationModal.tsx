'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

interface EmailOtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function EmailOtpVerificationModal({
  isOpen,
  email,
  onClose,
  onSuccess,
}: EmailOtpVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setErrorMessage(null);
      setSuccessMessage(null);
      setTimer(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only accept numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.slice(-1); // Take last char
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto focus next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullOtp = codeToVerify || otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Silakan masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<any>('/auth/verify-email', {
        email,
        otp: fullOtp,
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Email berhasil diverifikasi!');
        setTimeout(() => {
          onSuccess(res.data);
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Kode verifikasi tidak valid.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memverifikasi kode OTP. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.post<any>('/auth/resend-otp', { email });
      if (res.success) {
        setSuccessMessage('Kode verifikasi baru telah dikirim ke email Anda.');
        setTimer(60);
      } else {
        setErrorMessage(res.message || 'Gagal mengirim ulang kode OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengirim ulang kode.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          className="w-full max-w-md rounded-3xl border border-[#0E8991]/30 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 text-foreground relative overflow-hidden"
        >
          {/* Subtle Ambient Top Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0E8991]/20 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0E8991] to-[#1bb2bd] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#0E8991]/25">
              <Mail className="w-8 h-8" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-2xl font-extrabold font-outfit text-foreground tracking-tight">
                Verifikasi Email Anda
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kami telah mengirimkan 6 digit kode OTP ke alamat email:
              </p>
              <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary font-mono">
                {email}
              </div>
            </div>

            {/* Error / Success Alerts */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2 text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 text-left"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 6 Digit OTP Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  disabled={isSubmitting}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-input bg-background/80 focus:border-[#0E8991] focus:ring-2 focus:ring-[#0E8991]/30 transition-all outline-none text-foreground shadow-inner disabled:opacity-50"
                />
              ))}
            </div>

            {/* Submit Action Button */}
            <div className="pt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerifyOtp()}
                disabled={isSubmitting || otp.includes('')}
                className="w-full h-12 rounded-2xl bg-[#0E8991] hover:bg-[#0C737A] text-white font-bold text-sm shadow-xl shadow-[#0E8991]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Verifikasi Email</span>
                    <ArrowRight className="w-4 h-4 text-[#EAA27C]" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Resend Cooldown & Action */}
            <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <span>Tidak menerima kode?</span>
              {timer > 0 ? (
                <span className="font-semibold text-foreground font-mono">
                  Kirim ulang dalam ({timer}s)
                </span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-bold text-[#0E8991] dark:text-[#1bb2bd] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Kirim Ulang OTP</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
