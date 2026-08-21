'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useLandingAuth } from '../../contexts/LandingAuthContext';
import { LoginForm } from '../forms/LoginForm';
import { RegisterForm } from '../forms/RegisterForm';
import { cn } from '../../lib/utils';

export function LandingAuthWrapper({ children }: { children: React.ReactNode }) {
  const { authMode, closeAuth, setAuthMode } = useLandingAuth();
  const isOpen = authMode !== null;

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeAuth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAuth]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background flex">
      {/* LEFT: Landing Page Container with 1.0s Compression Animation */}
      <motion.div
        layout="position"
        animate={{
          width: isOpen ? '54%' : '100%',
        }}
        transition={{
          duration: 1.0,
          ease: [0.16, 1, 0.3, 1], // Smooth Apple / Emil Kowalski physics
        }}
        className={cn(
          'min-h-screen flex flex-col relative transition-all origin-left will-change-[width]',
          isOpen && 'max-lg:w-full'
        )}
      >
        {/* Landing Page Content - Always crisp and interactive */}
        <div className="flex-1 w-full relative">
          {children}
        </div>
      </motion.div>

      {/* RIGHT: Auth Slide-in Panel with 1.0s Slide Animation */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? '0%' : '100%',
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          duration: 1.0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 h-screen overflow-y-auto bg-card/95 backdrop-blur-2xl border-l border-border shadow-[-20px_0_60px_rgba(0,0,0,0.15)] dark:shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col will-change-transform',
          'w-full sm:w-[500px] lg:w-[46%]'
        )}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#0E8991]/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Panel Header */}
        <div className="sticky top-0 z-20 px-6 py-4 border-b border-border bg-card/90 dark:bg-[#0C313A]/90 backdrop-blur-xl flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="HafalanKu Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain drop-shadow-sm"
            />
            <span className="font-outfit font-extrabold text-lg tracking-tight text-foreground">
              Hafalan<span className="text-[#0E8991] dark:text-[#1bb2bd]">Ku</span>
            </span>
          </div>

          {/* Tab Switcher: Masuk vs Daftar */}
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-background rounded-lg shadow-sm border border-border"
              initial={false}
              animate={{
                left: authMode === 'login' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={cn(
                'relative z-10 px-3.5 py-1.5 text-xs font-extrabold transition-colors flex items-center gap-1.5 rounded-lg',
                authMode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={cn(
                'relative z-10 px-3.5 py-1.5 text-xs font-extrabold transition-colors flex items-center gap-1.5 rounded-lg',
                authMode === 'register' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar
            </button>
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={closeAuth}
            className="p-2 rounded-xl border border-border bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm"
            title="Tutup & Kembali ke Beranda (Esc)"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Panel Scrollable Body */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full"
              >
                <LoginForm />
              </motion.div>
            ) : authMode === 'register' ? (
              <motion.div
                key="register-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full"
              >
                <RegisterForm />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Bottom Security Assurance Badge */}
          <div className="mt-8 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#EAA27C]" />
            <span>Enkripsi Data Standar Industri & Privasi Terjamin</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
