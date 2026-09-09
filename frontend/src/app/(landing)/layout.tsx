import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const metadata: Metadata = {
  title: "HafalanKu — Platform Manajemen Hafalan Al-Qur'an & Notifikasi WA Wali Murid",
  description:
    "Aplikasi managemen hafalan Al-Qur'an modern dengan pencatatan setoran instan, kalkulasi jadwal murajaah otomatis, notifikasi WhatsApp ke wali murid, dan enkripsi data AES-256.",
  keywords: ["HafalanKu", "Hafalan Quran", "Tahfidz", "Aplikasi Pesantren", "Murajaah", "WhatsApp Bot Quran", "Tahfidz Online"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "HafalanKu — Platform Manajemen Hafalan Al-Qur'an",
    description: "Aplikasi managemen hafalan Al-Qur'an modern dengan pencatatan setoran instan dan notifikasi WhatsApp ke wali murid.",
    url: 'https://hafalanku.forapp.id',
    siteName: 'HafalanKu',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "HafalanKu — Platform Manajemen Hafalan Al-Qur'an",
    description: "Aplikasi managemen hafalan Al-Qur'an modern dengan pencatatan setoran instan dan notifikasi WhatsApp ke wali murid.",
  }
};

import { LandingAuthProvider } from '../../contexts/LandingAuthContext';
import { LandingAuthWrapper } from '../../components/landing/LandingAuthWrapper';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HafalanKu',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    url: 'https://hafalanku.forapp.id',
    description: "Platform web progresif untuk pencatatan setoran hafalan Al-Qur'an, manajemen murajaah, dan integrasi WhatsApp untuk laporan otomatis wali santri.",
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR'
    }
  };

  return (
    <LandingAuthProvider>
      <LandingAuthWrapper>
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LandingAuthWrapper>
    </LandingAuthProvider>
  );
}
