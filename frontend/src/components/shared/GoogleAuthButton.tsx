'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
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
  organizationName,
  phone,
  onError,
  onSuccessMessage,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleCredentialResponse = async (response: any) => {
    const token = response?.credential || response?.access_token;
    if (!token) {
      onError?.('Gagal mendapatkan token kredensial Google.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<any>('/auth/google', {
        credential: token,
        accountType,
        organizationName,
        phone,
      });

      if (res.success && res.data) {
        if (res.data.token) {
          setAuth(res.data.user, res.data.token);
          if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
          }
          router.push('/dashboard');
        } else {
          onSuccessMessage?.(res.message || 'Akun Google berhasil terdaftar dan menunggu persetujuan Superadmin.');
        }
      } else {
        onError?.(res.message || 'Gagal masuk dengan akun Google.');
      }
    } catch (err: any) {
      onError?.(err.message || 'Terjadi kesalahan saat otentikasi Google.');
    } finally {
      setIsLoading(false);
    }
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
    </>
  );
}
