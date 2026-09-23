'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

import { useLandingAuth } from '../../contexts/LandingAuthContext';

export type BillingCycle = '1_month' | '6_months' | '1_year';

interface PlanPricing {
  price: string;
  period: string;
  note?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  pricing: Record<BillingCycle, PlanPricing>;
  popular: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
}

export function Pricing() {
  const { openAuth } = useLandingAuth();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('1_year');

  const plans: Plan[] = [
    {
      id: 'personal',
      name: 'Pribadi / Perorangan',
      description: 'Ideal untuk ustadz perorangan atau guru ngaji privat mandiri.',
      pricing: {
        '1_month': { price: 'Rp 15k', period: 'bulan', note: 'Ditagih per bulan' },
        '6_months': { price: 'Rp 85k', period: '6 bulan', note: 'Hemat! Setara ~Rp 14.1k/bulan' },
        '1_year': { price: 'Rp 165k', period: 'tahun', note: 'Paling Hemat! Setara ~Rp 13.7k/bulan' },
      },
      popular: false,
      features: [
        'Maksimal 20 Data Santri',
        'Catat Setoran Hafalan 114 Surat',
        'Fitur Penjadwalan Murajaah Cerdas',
        'Export Laporan PDF & Excel',
        'Akses Web Mobile & Desktop',
        'Uji Coba Gratis 30 Hari',
      ],
      buttonText: 'Mulai Uji Coba Gratis',
      buttonVariant: 'outline',
    },
    {
      id: 'organization',
      name: 'Organisasi',
      description: 'Solusi lengkap untuk TPQ, Rumah Tahfidz, Sekolah & Pesantren.',
      pricing: {
        '1_month': { price: 'Rp 55k', period: 'bulan', note: 'Ditagih per bulan' },
        '6_months': { price: 'Rp 300k', period: '6 bulan', note: 'Hemat! Setara Rp 50k/bulan' },
        '1_year': { price: 'Rp 550k', period: 'tahun', note: 'Paling Hemat! Setara ~Rp 45.8k/bulan' },
      },
      popular: true,
      features: [
        'Santri & Kelas Tanpa Batas',
        'Multi-Admin & Akses Pengajar',
        'Integrasi Notifikasi WhatsApp Bot',
        'Fitur Prioritas Murajaah Cerdas',
        'Laporan Rekapitulasi XLSX Lengkap',
        'Dukungan Prioritas 24/7',
      ],
      buttonText: 'Pilih Paket Organisasi',
      buttonVariant: 'primary',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Kustomisasi untuk yayasan besar dengan banyak cabang atau institusi.',
      pricing: {
        '1_month': { price: 'Rp 500k', period: 'bulan', note: 'Kapasitas & performa dedicated' },
        '6_months': { price: 'Rp 500k', period: 'bulan', note: 'Kapasitas & performa dedicated' },
        '1_year': { price: 'Rp 500k', period: 'bulan', note: 'Kapasitas & performa dedicated' },
      },
      popular: false,
      features: [
        'Semua Fitur Paket Organisasi',
        'Dukungan Multi-Cabang Yayasan',
        'Server Dedicated & SLA 99.9%',
        'Kustomisasi Domain (White-label)',
        'Pelatihan Penggunaan untuk Staf',
        'Dukungan Teknis Prioritas Khusus',
      ],
      buttonText: 'Pilih Paket Enterprise',
      buttonVariant: 'outline',
    },
  ];

  return (
    <section id="harga" className="py-32 relative overflow-hidden bg-background">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0E8991]/10 via-background to-background" />

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
          <div className="flex items-center justify-center pt-4">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-muted/80 border border-border backdrop-blur-md shadow-inner gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('1_month')}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === '1_month'
                    ? 'text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {billingCycle === '1_month' && (
                  <motion.div
                    layoutId="pricingTabIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#0E8991] to-[#12a4ae]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">1 Bulan</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('6_months')}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === '6_months'
                    ? 'text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {billingCycle === '6_months' && (
                  <motion.div
                    layoutId="pricingTabIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#0E8991] to-[#12a4ae]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">6 Bulan</span>
                <span
                  className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    billingCycle === '6_months'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#EAA27C]/20 border border-[#EAA27C]/40 text-[#EAA27C]'
                  }`}
                >
                  Hemat
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('1_year')}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === '1_year'
                    ? 'text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {billingCycle === '1_year' && (
                  <motion.div
                    layoutId="pricingTabIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#0E8991] to-[#12a4ae]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">1 Tahun</span>
                <span
                  className={`relative z-10 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    billingCycle === '1_year'
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  Paling Hemat
                </span>
              </button>
            </div>
          </div>

          {/* Tombol Coba Free 30 Hari */}
          <div className="flex flex-col items-center justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => openAuth('register')}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0E8991] to-[#12a4ae] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0E8991]/25 hover:shadow-lg hover:shadow-[#0E8991]/40 transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-[#EAA27C] animate-pulse" />
              <span>Coba Free 30 Hari</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <p className="text-[11px] text-muted-foreground mt-2 font-medium">
              🎁 Tanpa biaya di awal • Akses penuh semua fitur gratis selama 30 hari
            </p>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch perspective-1000">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, rotateY: idx === 0 ? 10 : idx === 2 ? -10 : 0 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: idx * 0.15, type: "spring", bounce: 0.4 }}
              whileHover={{
                y: -10,
                scale: 1.02,
                boxShadow: plan.popular
                  ? "0 30px 60px rgba(14,137,145,0.2)"
                  : "0 20px 40px rgba(0,0,0,0.1)"
              }}
              className={`rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between relative transition-all duration-500 ease-out transform-style-3d shadow-md ${plan.popular
                  ? 'border-2 border-[#0E8991] bg-gradient-to-b from-[#0E8991]/15 via-card to-card dark:from-[#0E8991]/20 dark:via-[#0C313A] dark:to-[#0C313A] z-10 shadow-[#0E8991]/15'
                  : 'border border-border bg-card dark:bg-[#0C313A] text-card-foreground'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#0E8991] to-[#12a4ae] text-white font-bold text-xs shadow-[0_4px_20px_rgba(14,137,145,0.4)] flex items-center gap-1.5 z-20">
                  <Sparkles className="w-3.5 h-3.5 text-[#EAA27C]" /> Paling Populer
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold font-outfit text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 min-h-[40px] font-light">{plan.description}</p>
                </div>

                <div className="border-y border-border py-6">
                  <div className="flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={plan.pricing[billingCycle].price}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight"
                      >
                        {plan.pricing[billingCycle].price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-sm text-muted-foreground font-medium">/ {plan.pricing[billingCycle].period}</span>
                  </div>
                  {plan.pricing[billingCycle].note && (
                    <p className="text-xs text-[#0E8991] dark:text-[#1bb2bd] font-medium mt-2">
                      {plan.pricing[billingCycle].note}
                    </p>
                  )}
                </div>

                <ul className="space-y-4 text-sm text-muted-foreground pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-[#0E8991]/20 text-[#0E8991] dark:text-[#1bb2bd] shrink-0 mt-0.5">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-foreground/90 font-medium leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openAuth('register')}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${plan.buttonVariant === 'primary'
                      ? 'bg-gradient-to-r from-[#0E8991] to-[#12a4ae] text-white shadow-lg shadow-[#0E8991]/25 hover:shadow-[#0E8991]/40'
                      : 'border border-border bg-muted/60 hover:bg-muted text-foreground'
                    }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-[#EAA27C]" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
