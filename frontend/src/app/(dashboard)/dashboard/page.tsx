'use client';

import React from 'react';
import { WelcomeCard } from '../../../components/dashboard/WelcomeCard';
import { StatCard, StatCardSkeleton } from '../../../components/dashboard/StatCard';
import { useDashboardStats } from '../../../hooks/useDashboard';
import { motion } from 'motion/react';
import { BookOpen, UserPlus, FileSpreadsheet, ArrowRight } from 'lucide-react';
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
      <div>
        <h2 className="text-lg font-semibold font-outfit text-foreground mb-4 flex items-center gap-2">
          Ringkasan Data
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl glass border border-destructive/30 text-destructive text-sm text-center">
            Gagal memuat statistik dashboard. Silakan muat ulang halaman.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data?.stats.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Shortcuts */}
      {user?.role !== 'SUPERADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold font-outfit text-foreground">Tambah Santri Baru</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daftarkan santri baru ke dalam sistem untuk memulai pencatatan setoran hafalan.
              </p>
            </div>
            <Link
              href="/santri"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors mt-6"
            >
              <span>Kelola Santri</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {user?.role === 'USER' && (
            <>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold font-outfit text-foreground">Input Setoran Hafalan</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Catat setoran hafalan baru santri lengkap dengan penilaian predikat (Mumtaz, Jayyid, dll).
                  </p>
                </div>
                <Link
                  href="/hafalan"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors mt-6"
                >
                  <span>Catat Hafalan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold font-outfit text-foreground">Jadwal Murajaah</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lihat jadwal dan urutan surat murajaah yang perlu diulang oleh santri hari ini.
                  </p>
                </div>
                <Link
                  href="/murajaah"
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline transition-colors mt-6"
                >
                  <span>Lihat Murajaah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
