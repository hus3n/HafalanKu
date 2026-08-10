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
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden animated-bg">
      <AnimatedBackground />

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <motion.main
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 
            ? (isCollapsed ? 80 : 280) 
            : 0
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden" 
      >
        <Topbar />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 no-scrollbar scroll-smooth relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}


