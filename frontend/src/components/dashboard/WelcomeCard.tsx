'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, Calendar, BookOpen, Clock } from 'lucide-react';

export function WelcomeCard() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate Islamic dynamic greeting based on hour of the day (WIB)
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour >= 4 && currentHour < 11) return { time: 'Pagi', quote: 'Awali pagi dengan tilawah dan berkah Al-Qur’an.' };
    if (currentHour >= 11 && currentHour < 15) return { time: 'Siang', quote: 'Jaga hafalan dengan istiqomah dan kesabaran.' };
    if (currentHour >= 15 && currentHour < 18) return { time: 'Sore', quote: 'Waktu terbaik untuk mengulang dan memperkuat murajaah.' };
    return { time: 'Malam', quote: 'Hafalan yang dijaga di malam hari akan menjadi penerang di hari akhir.' };
  };

  const { time, quote } = getGreeting();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
            Superadmin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border border-[#EAA27C]/40">
            Admin Lembaga
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0E8991]/15 text-[#0E8991] dark:text-[#1bb2bd] border border-[#0E8991]/30">
            Pengajar Al-Qur'an
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-[#0E8991]/10 dark:from-[#0C313A] dark:via-[#0C313A] dark:to-[#071a1f] p-6 md:p-8 border border-border shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] mb-6"
    >
      {/* Subtle Ambient Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0E8991]/10 dark:bg-[#0E8991]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-semibold bg-muted/70 px-3 py-1 rounded-full border border-border">
              <Calendar className="w-3.5 h-3.5 text-[#0E8991] dark:text-[#1bb2bd]" />
              {today}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/80">
              <Clock className="w-3 h-3 text-[#EAA27C]" />
              Waktu {time}
            </span>
            {getRoleBadge(user?.role)}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-foreground tracking-tight pt-1">
            Assalamu’alaikum, <span className="text-[#0E8991] dark:text-[#1bb2bd]">{user?.name || 'Ustadz'}</span> 👋
          </h1>
          
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
            {quote} Pantau dan evaluasi setoran hafalan santri dengan mudah dan terstruktur.
          </p>
        </div>

        {/* Motivational Floating Badge */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="self-start md:self-center shrink-0"
        >
          <div className="flex items-center gap-3 bg-[#0E8991] hover:bg-[#0C737A] text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-lg shadow-[#0E8991]/25 border border-white/20 transition-all cursor-default">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#EAA27C]" />
            </div>
            <div>
              <p className="font-extrabold text-white text-[11px] leading-tight">HafalanKu Pro</p>
              <p className="text-white/80 text-[10px] font-medium leading-tight">Sistem Tahfizh Modern</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
