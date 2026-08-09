'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Mandiri / Perorangan',
      description: 'Ideal untuk ustadz perorangan atau guru ngaji private.',
      priceMonthly: 'Rp 0',
      priceAnnual: 'Rp 0',
      period: 'Gratis Selamanya',
      popular: false,
      features: [
        'Maksimal 20 Data Santri',
        'Catat Setoran Hafalan 114 Surat',
        'Fitur Penjadwalan Murajaah',
        'Export Laporan PDF/Excel',
        'Akses Web Mobile & Desktop',
      ],
      buttonText: 'Mulai Uji Coba Gratis',
      buttonVariant: 'outline',
    },
    {
      name: 'Lembaga / Pesantren',
      description: 'Solusi lengkap untuk Rumah Tahfidz, Sekolah, & Pesantren.',
      priceMonthly: 'Rp 99k',
      priceAnnual: 'Rp 79k',
      period: 'per bulan',
      popular: true,
      features: [
        'Santri & Kelas Tanpa Batas',
        'Multi-Admin & Akses Pengajar',
        'Integrasi Notifikasi WhatsApp Bot',
        'Auto-Backup Cloud Telegram',
        'Algoritma Prioritas Murajaah Cerdas',
        'Laporan Rekapitulasi XLSX Lengkap',
        'Dukungan Prioritas 24/7',
      ],
      buttonText: 'Pilih Paket Lembaga',
      buttonVariant: 'primary',
    },
    {
      name: 'Enterprise Multi-Cabang',
      description: 'Kustomisasi untuk yayasan besar dengan banyak cabang.',
      priceMonthly: 'Kontak',
      priceAnnual: 'Kontak',
      period: 'kustomisasi khusus',
      popular: false,
      features: [
        'Semua Fitur Paket Lembaga',
        'Dukungan Multi-Cabang Yayasan',
        'Server Dedicated & SLA 99.9%',
        'Kustomisasi Domain (White-label)',
        'Pelatihan Penggunaan untuk Staf',
      ],
      buttonText: 'Konsultasi Sekarang',
      buttonVariant: 'outline',
    },
  ];

  return (
    <section id="harga" className="py-32 relative overflow-hidden bg-background">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-foreground tracking-tight">
            Transparan & Terjangkau
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-light">
            Pilih paket yang paling sesuai dengan kebutuhan lembaga atau personal Anda.
          </p>

          {/* Animated Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Bayar Bulanan
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-16 h-8 rounded-full bg-secondary/80 border border-white/10 p-1 relative flex items-center focus:outline-none shadow-inner"
            >
              <motion.div
                layout
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-primary shadow-md"
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-2 transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Bayar Tahunan 
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-bold px-2.5 py-0.5 rounded-full"
              >
                Hemat 20%
              </motion.span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch perspective-1000">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, rotateY: idx === 0 ? 10 : idx === 2 ? -10 : 0 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: idx * 0.15, type: "spring", bounce: 0.4 }}
              whileHover={{ 
                y: -15, 
                scale: 1.02,
                boxShadow: plan.popular 
                  ? "0 40px 80px rgba(16,185,129,0.2)" 
                  : "0 30px 60px rgba(0,0,0,0.1)"
              }}
              className={`rounded-[2rem] p-8 flex flex-col justify-between relative transition-all duration-500 ease-out transform-style-3d ${
                plan.popular
                  ? 'border border-primary/50 bg-gradient-to-b from-primary/10 to-background backdrop-blur-3xl z-10'
                  : 'border border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-primary text-white font-bold text-xs shadow-[0_4px_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5 z-20">
                  <Sparkles className="w-3.5 h-3.5" /> Paling Populer
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-outfit text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 min-h-[40px] font-light">{plan.description}</p>
                </div>

                <div className="border-y border-white/10 dark:border-white/5 py-6">
                  <div className="flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={isAnnual ? plan.priceAnnual : plan.priceMonthly}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight"
                      >
                        {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-sm text-muted-foreground font-medium">/ {plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-muted-foreground pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-500 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-foreground/90 font-medium leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10">
                <Link href="/register" className="w-full block">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      plan.buttonVariant === 'primary'
                        ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                        : 'border border-white/20 bg-white/5 hover:bg-white/10 text-foreground'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
