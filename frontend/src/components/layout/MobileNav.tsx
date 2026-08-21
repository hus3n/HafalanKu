'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, ShieldCheck, User } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { useAuth } from '../../hooks/useAuth';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close nav automatically whenever pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push('/login');
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999]"
          />
          
          {/* Drawer Panel - Full 100dvh viewport height */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-[300px] max-w-[85vw] h-[100dvh] bg-[#091c15] dark:bg-[#06140e] text-white border-r border-emerald-500/20 shadow-[20px_0_60px_rgba(0,0,0,0.8)] z-[1000] flex flex-col p-5 overflow-hidden"
          >
            {/* Drawer Header with Logo & Close Button */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white p-1.5 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-md">
                  <Image 
                    src="/logo.png" 
                    alt="HafalanKu Logo" 
                    width={28} 
                    height={28} 
                    className="w-full h-full object-contain drop-shadow-sm" 
                  />
                </div>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <span className="text-xl font-extrabold font-outfit text-white tracking-tight">
                    Hafalan<span className="text-emerald-400">Ku</span>
                  </span>
                </Link>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
                title="Tutup Menu"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Quick Profile Badge */}
            {user && (
              <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-emerald-500/20 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">{user.role}</p>
                </div>
              </div>
            )}

            {/* Scrollable Navigation Menu */}
            <div 
              className="flex-1 overflow-y-auto no-scrollbar py-1 space-y-1"
              onClick={(e) => {
                // If a link is clicked, close the drawer
                const target = e.target as HTMLElement;
                if (target.closest('a')) {
                  setIsOpen(false);
                }
              }}
            >
              <SidebarMenu isMobile={true} />
            </div>

            {/* Drawer Footer with Logout */}
            <div className="pt-4 mt-auto border-t border-white/10 shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      {/* Mobile Hamburger Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer flex items-center justify-center"
        title="Buka Menu Navigasi"
        aria-label="Buka Menu Navigasi"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Render Portal directly into document.body to prevent parent container clipping */}
      {mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}
