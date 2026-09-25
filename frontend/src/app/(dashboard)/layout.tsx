'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';
import { useSidebarStore } from '../../stores/sidebarStore';
import { EmailOtpVerificationModal } from '../../components/modals/EmailOtpVerificationModal';

const emptySubscribe = () => () => {};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isMounted, router]);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden animated-bg selection:bg-emerald-500/20 selection:text-emerald-400">
      <AnimatedBackground />

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col min-w-0 h-[100dvh] max-h-[100dvh] overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isCollapsed ? 'md:ml-20' : 'md:ml-[280px]'
        }`}
      >
        <Topbar />
        
        {user && !user.isEmailVerified && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Email Anda belum diverifikasi. Silakan verifikasi untuk mengamankan akun Anda.</p>
            </div>
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-sm"
            >
              Verifikasi Email
            </button>
          </div>
        )}

        {user && !user.isActive && !user.isTrial && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 md:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p>Akun/Paket Anda belum aktif. Halaman pencatatan dan WA diblokir. Silakan selesaikan pembayaran.</p>
            </div>
            <a
              href="https://wa.me/6285229925593"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-sm"
            >
              Hubungi Admin
            </a>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-16 md:pb-8 no-scrollbar scroll-smooth relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <EmailOtpVerificationModal 
          isOpen={isOtpModalOpen} 
          email={user?.email || ''}
          onClose={() => setIsOtpModalOpen(false)} 
          onSuccess={() => {
            setIsOtpModalOpen(false);
          }} 
        />
      </main>
    </div>
  );
}
