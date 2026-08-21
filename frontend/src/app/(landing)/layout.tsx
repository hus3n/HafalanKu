import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const metadata: Metadata = {
  title: "HafalanKu — Platform Manajemen Hafalan Al-Qur'an & Notifikasi WA Wali Murid",
  description:
    "Aplikasi managemen hafalan Al-Qur'an modern dengan pencatatan setoran instan, kalkulasi jadwal murajaah otomatis, notifikasi WhatsApp ke wali murid, dan enkripsi data AES-256.",
  keywords: ["HafalanKu", "Hafalan Quran", "Tahfidz", "Aplikasi Pesantren", "Murajaah", "WhatsApp Bot Quran"],
};

import { LandingAuthProvider } from '../../contexts/LandingAuthContext';
import { LandingAuthWrapper } from '../../components/landing/LandingAuthWrapper';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingAuthProvider>
      <LandingAuthWrapper>
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LandingAuthWrapper>
    </LandingAuthProvider>
  );
}
