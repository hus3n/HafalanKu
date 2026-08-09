'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Play, ShieldCheck, Smartphone, Users, BookOpen, Bell } from 'lucide-react';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth Parallax
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[100svh] flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
      
      {/* Deep Spatial Background */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        
        {/* Top Hero Text */}
        <motion.div 
          style={{ opacity: opacityHero }}
          className="text-center space-y-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border bg-card shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground tracking-wide uppercase">Telah Hadir: HafalanKu v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-outfit tracking-tight leading-[1.15] text-foreground"
          >
            Sistem Manajemen <br className="hidden sm:block" />
            <span className="text-emerald-600 dark:text-emerald-400">
              Tahfidz Cerdas & Modern
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Platform digital mutakhir untuk mencatat hafalan santri, notifikasi WhatsApp otomatis ke wali murid, dan penjadwalan murajaah otomatis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-sm font-extrabold shadow-xl shadow-emerald-600/25 transition-all"
              >
                <span>Mulai Uji Coba Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <Link href="#fitur" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border bg-card text-foreground font-bold text-sm shadow-md hover:bg-muted transition-all"
              >
                <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <span>Pelajari Lebih Lanjut</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Clean & Vibrant Floating Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-16 sm:mt-20 w-full max-w-5xl relative z-10"
        >
          {/* Dashboard Container - High Contrast Solid Card */}
          <div className="relative rounded-3xl border border-border bg-card text-card-foreground shadow-[0_25px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
            
            {/* Window Controls Topbar */}
            <div className="h-11 bg-muted/80 border-b border-border flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-[11px] text-muted-foreground font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> app.hafalanku.com
              </div>
            </div>

            {/* Mockup Dashboard Body Content */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-card">
              
              {/* Left Column (Stats & Recent Activity) */}
              <div className="space-y-6 col-span-1 md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Total Santri Card */}
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Total Santri</span>
                      <div className="text-3xl font-extrabold font-outfit text-foreground">1,248</div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Setoran Hari Ini Card */}
                  <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">Setoran Hari Ini</span>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-extrabold font-outfit text-foreground">432</div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+12%</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>

                </div>

                {/* Recent Activity List */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-sm font-bold text-foreground">Setoran Hafalan Terbaru</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Hari Ini</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          AZ
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Ahmad Zaki</p>
                          <p className="text-[11px] text-muted-foreground">Surah Al-Mulk: Ayat 1 - 15</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Mumtaz
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                          SN
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Siti Nurhaliza</p>
                          <p className="text-[11px] text-muted-foreground">Surah An-Naba: Ayat 1 - 30</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Mumtaz
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          MR
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Muhammad Rizky</p>
                          <p className="text-[11px] text-muted-foreground">Surah Ar-Rahman: Ayat 1 - 20</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Jayyid Jiddan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (WhatsApp Gateway Card) */}
              <div className="col-span-1">
                <div className="h-full rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">WhatsApp Gateway</h4>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Terhubung (Baileys)
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sistem secara otomatis mengirimkan pesan rekapitulasi hafalan langsung ke nomor WhatsApp wali murid.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Notifikasi Terkirim</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-foreground leading-snug">
                      💬 "Assalamu’alaikum Wali Santri Ahmad Zaki, setoran Surah Al-Mulk ayat 1-15 hari ini mendapat predikat <strong className="text-emerald-600 dark:text-emerald-400">Mumtaz</strong>."
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Soft Glow behind mockup */}
          <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-60 -z-10" />
        </motion.div>

      </div>
    </section>
  );
}

