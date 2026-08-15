'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  History, 
  Settings, 
  ShieldAlert,
  HardDrive,
  Building,
  QrCode,
  Bell,
  Server
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface SidebarMenuProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
}

export function SidebarMenu({ isCollapsed = false, isMobile = false }: SidebarMenuProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role || 'USER';

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['SUPERADMIN', 'ADMIN', 'USER'],
    },
    {
      title: 'Santri',
      href: '/santri',
      icon: <Users className="w-5 h-5" />,
      roles: ['ADMIN', 'USER'],
    },
    {
      title: 'Kelas',
      href: '/kelas',
      icon: <Building className="w-5 h-5" />,
      roles: ['ADMIN', 'USER'],
    },
    {
      title: 'Hafalan (Riwayat)',
      href: '/hafalan',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['USER'],
    },
    {
      title: 'Hafalan Awal',
      href: '/hafalan/rekap',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['USER'],
    },
    {
      title: 'Murajaah',
      href: '/murajaah',
      icon: <History className="w-5 h-5" />,
      roles: ['USER'],
    },
    {
      title: 'WhatsApp Gateway',
      href: '/settings/whatsapp',
      icon: <QrCode className="w-5 h-5" />,
      roles: ['SUPERADMIN', 'ADMIN', 'USER'],
    },
    {
      title: 'Notifikasi Log',
      href: '/notifikasi',
      icon: <Bell className="w-5 h-5" />,
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Backup & Restore',
      href: '/backup',
      icon: <HardDrive className="w-5 h-5" />,
      roles: ['SUPERADMIN'],
    },
    {
      title: 'Manajemen User',
      href: '/admin',
      icon: <ShieldAlert className="w-5 h-5" />,
      roles: ['SUPERADMIN', 'ADMIN'],
    },
    {
      title: 'Superadmin Panel',
      href: '/superadmin',
      icon: <ShieldAlert className="w-5 h-5" />,
      roles: ['SUPERADMIN'],
    },
    {
      title: 'Pengaturan Sistem',
      href: '/settings/system',
      icon: <Server className="w-5 h-5" />,
      roles: ['SUPERADMIN'],
    },
    {
      title: 'Profil Saya',
      href: '/profil',
      icon: <Settings className="w-5 h-5" />,
      roles: ['SUPERADMIN', 'ADMIN', 'USER'],
    },
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(role)) return false;

    // Custom visibility rules based on organization affiliation (Task-11)
    if (item.href === '/kelas' || item.href === '/santri') {
      if (role === 'USER' && user?.organizationId) return false;
    }
    
    if (item.href === '/settings/whatsapp') {
      if (role === 'USER' && !user?.organizationId) return false;
    }

    return true;
  });

  return (
    <nav className="space-y-1.5 select-none">
      {visibleMenuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href} className="block relative group">
            <motion.div
              whileHover={{ x: isCollapsed ? 0 : 3 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-3 py-3 rounded-2xl transition-all relative z-10 font-medium",
                isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-4",
                isActive 
                  ? "text-white font-bold" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <span className={cn(
                "transition-all duration-200 shrink-0", 
                isActive ? "scale-110 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-white/70 group-hover:text-white"
              )}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="text-sm tracking-tight truncate">{item.title}</span>
              )}
            </motion.div>
            
            {/* Active Pill Spring Indicator with Emerald Glow Aura */}
            {isActive && (
              <motion.div
                layoutId={isMobile ? "active-nav-bg-mobile" : "active-nav-bg-desktop"}
                className={cn(
                  "absolute bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 rounded-2xl z-0 shadow-lg shadow-emerald-600/30 border border-emerald-400/40",
                  isCollapsed ? "inset-y-0 left-2 right-2" : "inset-0"
                )}
                initial={false}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            {/* Popup Tooltip for Mini Collapsed Sidebar */}
            {isCollapsed && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-card text-card-foreground border border-border shadow-2xl px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  {item.title}
                </div>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
