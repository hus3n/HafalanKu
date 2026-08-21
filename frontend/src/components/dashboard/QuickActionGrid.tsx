'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  QrCode, 
  Users, 
  Building, 
  History, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  HardDrive,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export function QuickActionGrid() {
  const { user } = useAuth();
  const role = user?.role || 'USER';

  // 5 Core Requested Menus + Role Adaptive configuration
  const ustadzActions = [
    {
      title: 'Pencatatan Hafalan',
      desc: 'Input setoran baru',
      href: '/hafalan',
      icon: <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bgIcon: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20 text-amber-500',
      badge: 'Utama',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      accentGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    },
    {
      title: 'Pairing WhatsApp',
      desc: 'Scan QR Gateway',
      href: '/settings/whatsapp',
      icon: <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-500',
      badge: 'Auto WA',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      accentGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    {
      title: 'Manajemen Santri',
      desc: 'Data & wali murid',
      href: '/santri',
      icon: <Users className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
      bgIcon: 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/20 text-sky-500',
      badge: 'Santri',
      badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      accentGlow: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
    },
    {
      title: 'Manajemen Kelas',
      desc: 'Rombel & halaqah',
      href: '/kelas',
      icon: <Building className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
      bgIcon: 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20 text-purple-500',
      badge: 'Kelas',
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      accentGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
    },
    {
      title: 'Jadwal Murajaah',
      desc: 'Kalkulasi cerdas',
      href: '/murajaah',
      icon: <History className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
      bgIcon: 'bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/20 text-teal-500',
      badge: 'Harian',
      badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
      accentGlow: 'hover:border-teal-500/40 hover:shadow-teal-500/10',
    },
  ];

  const adminActions = [
    {
      title: 'Manajemen Santri',
      desc: 'Data & nomor wali',
      href: '/santri',
      icon: <Users className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
      bgIcon: 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/20 text-sky-500',
      badge: 'Santri',
      badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      accentGlow: 'hover:border-sky-500/40 hover:shadow-sky-500/10',
    },
    {
      title: 'Manajemen Kelas',
      desc: 'Rombel & halaqah',
      href: '/kelas',
      icon: <Building className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
      bgIcon: 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20 text-purple-500',
      badge: 'Kelas',
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      accentGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
    },
    {
      title: 'Pairing WhatsApp',
      desc: 'Scan QR Gateway',
      href: '/settings/whatsapp',
      icon: <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-500',
      badge: 'Auto WA',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      accentGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    {
      title: 'Pencatatan Hafalan',
      desc: 'Rekapitulasi setoran',
      href: '/hafalan',
      icon: <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bgIcon: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20 text-amber-500',
      badge: 'Setoran',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      accentGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
    },
    {
      title: 'Jadwal Murajaah',
      desc: 'Target pengulangan',
      href: '/murajaah',
      icon: <History className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
      bgIcon: 'bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/20 text-teal-500',
      badge: 'Murajaah',
      badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
      accentGlow: 'hover:border-teal-500/40 hover:shadow-teal-500/10',
    },
  ];

  const superadminActions = [
    {
      title: 'Manajemen User',
      desc: 'Admin & Pengajar',
      href: '/admin',
      icon: <UserCheck className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
      bgIcon: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/20 text-rose-500',
      badge: 'Admin',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      accentGlow: 'hover:border-rose-500/40 hover:shadow-rose-500/10',
    },
    {
      title: 'Pairing WhatsApp',
      desc: 'Status Gateway Pusat',
      href: '/settings/whatsapp',
      icon: <QrCode className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20 text-emerald-500',
      badge: 'Gateway',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      accentGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    },
    {
      title: 'Backup & Restore',
      desc: 'Cloud Telegram Auto',
      href: '/backup',
      icon: <HardDrive className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
      bgIcon: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20 text-blue-500',
      badge: 'Backup',
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      accentGlow: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
    },
    {
      title: 'Superadmin Panel',
      desc: 'Audit & System Log',
      href: '/superadmin',
      icon: <ShieldCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
      bgIcon: 'bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20 text-purple-500',
      badge: 'Master',
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      accentGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
    },
    {
      title: 'Data Santri Global',
      desc: 'Seluruh Lembaga',
      href: '/santri',
      icon: <Users className="w-5 h-5 text-teal-500 dark:text-teal-400" />,
      bgIcon: 'bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/20 text-teal-500',
      badge: 'Database',
      badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
      accentGlow: 'hover:border-teal-500/40 hover:shadow-teal-500/10',
    },
  ];

  const actions = role === 'SUPERADMIN' ? superadminActions : role === 'ADMIN' ? adminActions : ustadzActions;

  return (
    <section className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold font-outfit text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Menu & Akses Cepat</span>
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
          Akses langsung ke fitur operasional utama
        </span>
      </div>

      {/* Responsive Compact Grid - 2 cols on mobile, 3 on tablet, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {actions.map((item, idx) => (
          <Link key={item.href} href={item.href} className="block group">
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "p-3 sm:p-4 rounded-2xl bg-card dark:bg-[#0c2017] border border-border dark:border-emerald-500/20 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden",
                item.accentGlow
              )}
            >
              {/* Top Row: Icon + Badge + Arrow */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className={cn("p-2 sm:p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-108 shrink-0", item.bgIcon)}>
                  {item.icon}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={cn("hidden xs:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border", item.badgeColor)}>
                    {item.badge}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-muted/60 dark:bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Bottom: Title & Subtitle */}
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold font-outfit text-foreground leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-normal leading-tight truncate">
                  {item.desc}
                </p>
              </div>

              {/* Subtle Bottom Glow on Hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
