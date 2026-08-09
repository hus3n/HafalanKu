'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { MessageSquare, Brain, ShieldCheck, FileSpreadsheet, Building, Users } from 'lucide-react';

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Notifikasi WhatsApp Wali Murid',
      description: 'Kirim laporan hasil setoran hafalan otomatis langsung ke nomor WhatsApp orang tua santri.',
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/10 border-primary/20',
      title: 'Algoritma Murajaah Cerdas',
      description: 'Sistem secara otomatis mengkalkulasi prioritas pengulangan surat berdasarkan predikat.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-500/10 border-purple-500/20',
      title: 'Enkripsi Data & Auto-Backup',
      description: 'Data terenkripsi dengan AES-256-GCM. Fitur pencadangan otomatis ke Cloud Bot Telegram.',
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Laporan Rekapitulasi Excel',
      description: 'Cetak dan unduh laporan capaian hafalan santri dalam format berkas Microsoft Excel (.XLSX).',
    },
    {
      icon: <Building className="w-6 h-6 text-sky-500" />,
      bg: 'bg-sky-500/10 border-sky-500/20',
      title: 'Manajemen Kelas & Santri',
      description: 'Kelompokkan santri berdasarkan kelas dan kriteria jenjang hafalan dengan antarmuka yang cepat.',
    },
    {
      icon: <Users className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-500/10 border-rose-500/20',
      title: 'Dukungan Multi-Role Akses',
      description: 'Hak akses bertingkat untuk Superadmin, Admin Lembaga, serta Ustadz Pengampu.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <section id="fitur" ref={containerRef} className="py-32 relative perspective-1000 overflow-hidden">
      
      {/* Background Parallax Element */}
      <motion.div style={{ y: yBg }} className="absolute -left-[20%] top-0 w-[60%] h-[100%] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 tracking-wide uppercase">
            Fungsi & Fitur Utama
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-foreground tracking-tight">
            Solusi Lengkap untuk Manajemen Tahfidz
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Dirancang khusus dengan antarmuka yang modern, cepat, dan mudah dipahami oleh ustadz maupun wali murid.
          </p>
        </motion.div>

        {/* Features Grid (Staggered Entrance) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                rotateX: 5, 
                rotateY: -5,
                boxShadow: "0 30px 60px rgba(0,0,0,0.12)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="p-8 rounded-3xl border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transform-style-3d group relative overflow-hidden"
            >
              {/* Glass Glare Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out translate-x-[-100%] group-hover:translate-x-[100%]" />
              
              <div className={`p-4 rounded-2xl border ${item.bg} w-fit mb-6 shadow-inner transition-transform duration-500 ease-out group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold font-outfit text-foreground mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
