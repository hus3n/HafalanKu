'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Phone, Building2, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface GoogleAuthButtonProps {
  mode?: 'login' | 'register';
  accountType?: 'personal' | 'organization';
  organizationName?: string;
  phone?: string;
  onError?: (msg: string) => void;
  onSuccessMessage?: (msg: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAuthButton({
  mode = 'login',
  accountType = 'personal',
  organizationName = '',
  phone = '',
  onError,
  onSuccessMessage,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Phone Completion Modal State for Google Registration
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [inputPhone, setInputPhone] = useState(phone || '');
  const [inputOrgName, setInputOrgName] = useState(organizationName || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const submitGoogleAuth = async (token: string, phoneToSubmit: string, orgNameToSubmit: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<any>('/auth/google', {
        credential: token,
        accountType,
        organizationName: orgNameToSubmit || undefined,
        phone: phoneToSubmit || undefined,
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuth(res.data.user, res.data.token);
          if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
          }
          router.push('/dashboard');
        } else {
          setShowPhoneModal(false);
          const successText = res.message || 'Akun Google berhasil terdaftar & email terverifikasi! Menunggu aktivasi Superadmin.';
          onSuccessMessage?.(successText);

          // Susun link WhatsApp konfirmasi ke Superadmin
          if (phoneToSubmit) {
            const waNumber = '6285229925593';
            const waText = `Assalamu'alaikum Admin,\n\nSaya telah mendaftar akun HafalanKu via Google:\n\nEmail: ${res.data?.user?.email || '-'}\nNama: ${res.data?.user?.name || '-'}\nWhatsApp: ${phoneToSubmit}\nTipe Akun: ${accountType === 'organization' ? 'Admin Organisasi' : 'Pengajar/User'}\n\nMohon untuk diaktifkan. Terima kasih.`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
            try {
              window.open(waUrl, '_blank');
            } catch (e) {}
          }

          setTimeout(() => {
            router.push('/login?pending=true');
          }, 1500);
        }
      } else {
        onError?.(res.message || 'Gagal memproses pendaftaran akun Google.');
      }
    } catch (err: any) {
      onError?.(err.message || 'Terjadi kesalahan saat otentikasi Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    const token = response?.credential || response?.access_token;
    if (!token) {
      onError?.('Gagal mendapatkan token kredensial Google.');
      return;
    }

    // Jika mode registrasi dan nomor WA belum diisi, minta user melengkapi nomor WA terlebih dahulu
    if (mode === 'register' && (!phone && !inputPhone)) {
      setPendingGoogleToken(token);
      setShowPhoneModal(true);
      return;
    }

    await submitGoogleAuth(token, phone || inputPhone, organizationName || inputOrgName);
  };

  const handleGoogleClick = () => {
    if (!googleClientId) {
      onError?.(
        'Google Client ID belum diatur di server Coolify (NEXT_PUBLIC_GOOGLE_CLIENT_ID). Silakan gunakan pendaftaran formulir email di bawah.'
      );
      return;
    }

    if (typeof window === 'undefined' || !window.google) {
      onError?.('Layanan Google Sign-In sedang dimuat. Silakan tunggu sebentar atau muat ulang halaman.');
      return;
    }

    try {
      // 1. Inisialisasi Google GIS
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // 2. Tampilkan One-Tap / Pop-up OAuth
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: 'email profile openid',
              callback: (tokenResponse: any) => {
                if (tokenResponse?.access_token) {
                  handleCredentialResponse({ credential: tokenResponse.access_token });
                }
              },
            });
            tokenClient.requestAccessToken();
          } catch (oauthErr) {
            console.error('[Google OAuth Popup Error]', oauthErr);
          }
        }
      });
    } catch (e: any) {
      console.error('[Google Auth Error]', e);
      onError?.('Gagal memproses login Google. Pastikan domain terdaftar di Google Cloud Console.');
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = inputPhone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setPhoneError('Nomor WhatsApp wajib diisi minimal 9 digit (contoh: 08123456789).');
      return;
    }
    if (accountType === 'organization' && !inputOrgName.trim()) {
      setPhoneError('Nama Lembaga / TPQ wajib diisi.');
      return;
    }

    setPhoneError(null);
    if (pendingGoogleToken) {
      submitGoogleAuth(pendingGoogleToken, cleanPhone, inputOrgName);
    }
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      <motion.button
        type="button"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full h-12 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md shadow-black/20 border border-slate-200/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#0E8991]" />
            <span className="text-slate-600 font-medium">Menghubungkan ke Google...</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 tracking-tight">
              {mode === 'register' ? 'Daftar dengan Akun Google' : 'Lanjutkan dengan Google'}
            </span>
          </>
        )}
      </motion.button>

      {/* Modal Lengkapi Nomor WhatsApp untuk Pendaftar Akun Google */}
      <AnimatePresence>
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md rounded-3xl border border-[#0E8991]/30 bg-card/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 text-foreground relative overflow-hidden"
            >
              {/* Top Accent Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0E8991]/20 rounded-full blur-3xl pointer-events-none -z-10" />

              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0E8991] to-[#1bb2bd] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#0E8991]/25">
                  <Phone className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-outfit text-foreground">
                    Satu Langkah Lagi!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Masukkan nomor WhatsApp aktif Anda agar Admin dapat mengirimkan notifikasi saat akun Anda telah diaktifkan.
                  </p>
                </div>

                {phoneError && (
                  <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{phoneError}</span>
                  </div>
                )}

                <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left pt-2">
                  {accountType === 'organization' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Nama Lembaga / TPQ</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={inputOrgName}
                          onChange={(e) => setInputOrgName(e.target.value)}
                          placeholder="Contoh: TPQ Al-Ikhlas"
                          className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-input bg-background/80 focus:border-[#0E8991] focus:ring-1 focus:ring-[#0E8991] outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Nomor WhatsApp Aktif</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-[#0E8991]" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={inputPhone}
                        onChange={(e) => setInputPhone(e.target.value)}
                        placeholder="Contoh: 08123456789"
                        autoFocus
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded-xl border border-input bg-background/80 focus:border-[#0E8991] focus:ring-1 focus:ring-[#0E8991] outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      *Notifikasi aktivasi akun dan reminder hafalan santri akan dikirim ke nomor ini.
                    </p>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-2xl bg-[#0E8991] hover:bg-[#0C737A] text-white font-bold text-xs shadow-lg shadow-[#0E8991]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mendaftarkan...</span>
                        </>
                      ) : (
                        <>
                          <span>Selesaikan Pendaftaran</span>
                          <ArrowRight className="w-4 h-4 text-[#EAA27C]" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
