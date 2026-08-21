'use client';

import React from 'react';
import { WelcomeCard } from '../../../components/dashboard/WelcomeCard';
import { StatCard, StatCardSkeleton } from '../../../components/dashboard/StatCard';
import { QuickActionGrid } from '../../../components/dashboard/QuickActionGrid';
import { useDashboardStats } from '../../../hooks/useDashboard';
import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardStats();
  const { user } = useAuth();

  return (
    <div className="space-y-6 sm:space-y-7 pb-6">
      {/* Welcome Banner */}
      <WelcomeCard />

      {/* 5 Core Compact Quick Actions Menu (Pencatatan, Pairing WA, Santri, Kelas, Murajaah) */}
      <QuickActionGrid />

      {/* Role-Aware Stat Cards */}
      <section className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold font-outfit text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Ringkasan Statistik
          </h2>
          <span className="text-[11px] text-muted-foreground font-medium">
            Diperbarui real-time
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : isError ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold text-center">
            Gagal memuat statistik dashboard. Silakan muat ulang halaman.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {data?.stats.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
