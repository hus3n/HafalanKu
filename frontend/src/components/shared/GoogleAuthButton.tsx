'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1029384756-dummy.apps.googleusercontent.com';

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      onError?.('Gagal mendapatkan token kredensial Google.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<any>('/auth/google', {
        credential: response.credential,
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

  const triggerGooglePrompt = () => {
    if (typeof window === 'undefined' || !window.google) {
      onError?.('Layanan Google Sign-In sedang dimuat. Silakan tunggu sebentar atau muat ulang halaman.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Prompt One-Tap / Account Chooser
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is skipped/suppressed, fallback to standard OAuth popup
          console.log('[Google Auth] Fallback to standard prompt');
        }
      });
    } catch (e: any) {
      console.error('[Google Auth Error]', e);
      onError?.('Gagal menginisialisasi Google Sign-In. Pastikan kredensial Google Client ID telah terpasang.');
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      <button
        type="button"
        onClick={triggerGooglePrompt}
        disabled={isLoading}
        className="w-full h-11 rounded-xl border border-border bg-card/80 hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        )}
        <span>
          {mode === 'register' ? 'Daftar dengan Akun Google' : 'Lanjutkan dengan Google'}
        </span>
      </button>
    </>
  );
}
