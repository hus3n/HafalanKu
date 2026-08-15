'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '../shared/ThemeToggle';
import { InstallAppModal } from '../shared/InstallAppModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useSidebarStore } from '../../stores/sidebarStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  ChevronDown, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  ShieldCheck
} from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isCollapsed, toggleCollapsed } = useSidebarStore();
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();
  const { isStandalone } = usePWAInstall();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 md:h-20 border-b border-emerald-500/15 bg-[#05140d]/90 dark:bg-[#04100a]/90 backdrop-blur-2xl text-white sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-xl">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <MobileNav />

          {/* Sidebar Collapse/Expand Toggle Button (Desktop) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleCollapsed}
            className="hidden md:flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all border border-white/10 cursor-pointer shadow-sm"
            title={isCollapsed ? "Memperbesar Sidebar (280px)" : "Mengecilkan Sidebar (80px)"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-xs font-semibold text-white/80 hidden lg:inline">
              {isCollapsed ? "Buka Sidebar" : "Kecilkan"}
            </span>
          </motion.button>

          <div className="hidden sm:flex items-center gap-2.5 text-xs md:text-sm font-semibold text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]"></span>
            <span>Selamat Datang, <strong>{user?.name || 'Ustadz'}</strong></span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mode Aplikasi (Tanpa Tab) Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsInstallModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Buka atau Pasang Mode Aplikasi (Tanpa Tab Browser)"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">
              {isStandalone ? "Mode Aplikasi Aktif" : "Mode Aplikasi (Tanpa Tab)"}
            </span>
            <span className="inline md:hidden text-[11px]">
              App Mode
            </span>
          </motion.button>

          {/* Fullscreen Mode Toggle Button */}
          {isSupported && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer shrink-0 ${
                isFullscreen 
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.3)]' 
                  : 'bg-white/10 text-white/90 hover:text-white hover:bg-white/20 border-white/15'
              }`}
              title={isFullscreen ? "Keluar dari Layar Penuh (Esc / F11)" : "Tampilan Layar Penuh (Full Screen)"}
              aria-label={isFullscreen ? "Keluar dari Layar Penuh" : "Tampilan Layar Penuh"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </motion.button>
          )}

          {/* Role Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {user?.role || 'USER'}
          </span>

          {/* Notifications Bell */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/notifikasi')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors relative border border-white/15 cursor-pointer shrink-0"
            title="Notifikasi Log"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#05140d]"></span>
          </motion.button>
          
          <ThemeToggle />

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 p-1.5 pr-2.5 rounded-xl transition-all border border-white/15 shadow-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-emerald-400/30">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-white leading-none mb-0.5 truncate max-w-[100px]">{user?.name || 'Pengguna'}</p>
                <p className="text-[9px] text-emerald-300 font-semibold leading-none uppercase tracking-wider">{user?.role || 'USER'}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformOrigin: 'top right' }}
                  className="absolute right-0 mt-3 w-64 bg-card text-card-foreground rounded-2xl shadow-2xl overflow-hidden p-2 z-50 border border-border"
                >
                  {/* User Info Header Banner */}
                  <div className="px-4 py-3 bg-muted/60 rounded-xl mb-2 border border-border/50">
                    <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/10 text-primary border border-primary/20">
                      {user?.role}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setDropdownOpen(false); router.push('/profil'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-primary" /> Profil Saya
                  </button>
                  <button 
                    onClick={() => { setDropdownOpen(false); router.push('/settings/whatsapp'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-primary" /> Pengaturan WA
                  </button>
                  
                  <div className="h-px bg-border my-1.5 mx-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mode Aplikasi (Tanpa Tab) Modal */}
      <InstallAppModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />
    </>
  );
}
