'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, Calendar } from 'lucide-react';

export function WelcomeCard() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Superadmin</span>;
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Admin Organisasi</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Pengajar / User</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-card p-6 md:p-8 border border-border shadow-xl mb-8"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-semibold bg-muted px-3 py-1 rounded-full border border-border">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {today}
            </span>
            {getRoleBadge(user?.role)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-foreground tracking-tight flex items-center gap-2 pt-1">
            Assalamu’alaikum, <span className="text-emerald-600 dark:text-emerald-400">{user?.name || 'Ustadz'}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl font-medium">
            Selamat datang kembali di platform HafalanKu. Mari pantau dan catat perkembangan hafalan Al-Qur'an santri hari ini.
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="self-start md:self-center shrink-0"
        >
          <div className="flex items-center gap-2.5 bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 cursor-pointer hover:bg-emerald-700 transition-all">
            <Sparkles className="w-4 h-4" />
            <span>Semangat Mendidik</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
