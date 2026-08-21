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
      icon: <MessageSquare className="w-6 h-6 text-[#0E8991] dark:text-[#1bb2bd]" />,
      bg: 'bg-[#0E8991]/15 border-[#0E8991]/30',
      title: 'Notifikasi WhatsApp Wali Murid',
      description: 'Kirim laporan hasil setoran hafalan otomatis langsung ke nomor WhatsApp orang tua santri.',
    },
    {
      icon: <Brain className="w-6 h-6 text-[#8DB6BC]" />,
      bg: 'bg-[#8DB6BC]/15 border-[#8DB6BC]/30',
      title: 'Algoritma Murajaah Cerdas',
      description: 'Sistem secara otomatis mengkalkulasi prioritas pengulangan surat berdasarkan predikat.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#EAA27C]" />,
      bg: 'bg-[#EAA27C]/15 border-[#EAA27C]/30',
      title: 'Enkripsi Data & Auto-Backup',
      description: 'Data terenkripsi dengan AES-256-GCM. Fitur pencadangan otomatis ke Cloud Bot Telegram.',
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-[#E8BBA6]" />,
      bg: 'bg-[#E8BBA6]/15 border-[#E8BBA6]/30',
      title: 'Laporan Rekapitulasi Excel',
      description: 'Cetak dan unduh laporan capaian hafalan santri dalam format berkas Microsoft Excel (.XLSX).',
    },
    {
      icon: <Building className="w-6 h-6 text-[#0E8991] dark:text-[#1bb2bd]" />,
      bg: 'bg-[#0E8991]/15 border-[#0E8991]/30',
      title: 'Manajemen Kelas & Santri',
      description: 'Kelompokkan santri berdasarkan kelas dan kriteria jenjang hafalan dengan antarmuka yang cepat.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#EAA27C]" />,
      bg: 'bg-[#EAA27C]/15 border-[#EAA27C]/30',
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
    <section id="fitur" ref={containerRef} className="py-32 relative perspective-1000 overflow-hidden bg-background">
      
      {/* Background Parallax Element */}
      <motion.div style={{ y: yBg }} className="absolute -left-[20%] top-0 w-[60%] h-[100%] bg-[#0E8991]/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E8991]/10 text-[#0E8991] dark:text-[#1bb2bd] text-xs font-bold border border-[#0E8991]/20 tracking-wide uppercase">
            Fungsi & Fitur Utama
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-outfit text-foreground tracking-tight">
            Solusi Lengkap untuk Manajemen Tahfidz
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-normal">
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
                y: -8, 
                rotateX: 3, 
                rotateY: -3,
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="p-8 rounded-3xl border border-border dark:border-[#0E8991]/20 bg-card dark:bg-[#0C313A] text-card-foreground shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transform-style-3d group relative overflow-hidden transition-all duration-300"
            >
              <div className={`p-4 rounded-2xl border ${item.bg} w-fit mb-6 shadow-inner transition-transform duration-500 ease-out group-hover:scale-110`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-extrabold font-outfit text-foreground mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
