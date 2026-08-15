'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';
import { useSidebarStore } from '../../stores/sidebarStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      </main>
    </div>
  );
}
