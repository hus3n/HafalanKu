'use client';

import React from 'react';
import { WelcomeCard } from '../../../components/dashboard/WelcomeCard';
import { StatCard, StatCardSkeleton } from '../../../components/dashboard/StatCard';
import { useDashboardStats } from '../../../hooks/useDashboard';
import { motion } from 'motion/react';
import { BookOpen, UserPlus, History, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardStats();
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* Role-Aware Stat Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Ringkasan Statistik
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Diperbarui secara real-time
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : isError ? (
          <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold text-center">
            Gagal memuat statistik dashboard. Silakan muat ulang halaman.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data?.stats.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Action Command Center */}
      {user?.role !== 'SUPERADMIN' && (
        <section className="space-y-4 pt-2">
          <h2 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Aksi Cepat & Pintasan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Action 1: Santri */}
            <motion.div
              whileHover={{ y: -3 }}
              className="bg-card p-6 rounded-3xl border border-border/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 border border-white/10 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold font-outfit text-foreground">
                  Kelola Data Santri
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tambah santri baru, update nomor WhatsApp wali santri, dan atur penugasan kelas.
                </p>
              </div>
              <Link
                href="/santri"
                className="inline-flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl transition-all mt-6 border border-emerald-500/20"
              >
                <span>Buka Data Santri</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {user?.role === 'USER' && (
              <>
                {/* Action 2: Input Setoran */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-card p-6 rounded-3xl border border-border/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/25 border border-white/10 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold font-outfit text-foreground">
                      Input Setoran Hafalan
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Catat setoran hafalan baru santri secara cepat dengan predikat Mumtaz / Jayyid.
                    </p>
                  </div>
                  <Link
                    href="/hafalan"
                    className="inline-flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2.5 rounded-xl transition-all mt-6 border border-amber-500/20"
                  >
                    <span>Catat Hafalan</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Action 3: Murajaah */}
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-card p-6 rounded-3xl border border-border/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/25 border border-white/10 group-hover:scale-105 transition-transform">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold font-outfit text-foreground">
                      Jadwal Murajaah Harian
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Lihat target surat murajaah santri hari ini dan kirim laporan WhatsApp otomatis ke wali santri.
                    </p>
                  </div>
                  <Link
                    href="/murajaah"
                    className="inline-flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 px-4 py-2.5 rounded-xl transition-all mt-6 border border-teal-500/20"
                  >
                    <span>Lihat Murajaah</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
