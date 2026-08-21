'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Heart, ArrowUp } from 'lucide-react';

import { useLandingAuth } from '../../contexts/LandingAuthContext';

export function Footer() {
  const { openAuth } = useLandingAuth();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/10 bg-black/40 backdrop-blur-3xl pt-24 pb-10 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[40%] h-[200px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 md:col-span-5 lg:col-span-4"
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/25">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-outfit font-extrabold text-2xl tracking-tight text-foreground">
                Hafalan<span className="text-primary">Ku</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform managemen hafalan Al-Qur'an modern berbasis web dengan integrasi WhatsApp otomatis, penjadwalan murajaah cerdas, dan keamanan data berlapis.
            </p>

            {/* Hadith Quote Card */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-foreground/80 font-serif italic backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              &quot;Sebaik-baik kalian adalah orang yang mempelajari Al-Qur&apos;an dan mengajarkannya.&quot;
              <span className="block not-italic font-sans text-xs text-muted-foreground mt-2 font-semibold tracking-wide uppercase">
                — HR. Bukhari
              </span>
            </div>
          </motion.div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2" />

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 md:col-span-3 lg:col-span-3"
          >
            <h4 className="font-bold text-sm font-outfit text-foreground uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#fitur" className="hover:text-primary transition-colors">Fitur Utama</a></li>
              <li><a href="#keunggulan" className="hover:text-primary transition-colors">Keunggulan System</a></li>
              <li><a href="#harga" className="hover:text-primary transition-colors">Harga Paket</a></li>
              <li><a href="#testimoni" className="hover:text-primary transition-colors">Testimoni Pengasuh</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">Pertanyaan Umum (FAQ)</a></li>
            </ul>
          </motion.div>

          {/* Account Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 md:col-span-4 lg:col-span-3"
          >
            <h4 className="font-bold text-sm font-outfit text-foreground uppercase tracking-wider">Akses Pengguna</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <button
                  onClick={() => openAuth('login')}
                  className="hover:text-primary transition-colors text-left cursor-pointer"
                >
                  Masuk Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAuth('register')}
                  className="hover:text-primary transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  Daftar Akun Baru <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">GRATIS</span>
                </button>
              </li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground"
        >
          <p>© {new Date().getFullYear()} HafalanKu. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              Dibuat dengan <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> untuk Ummah
            </span>

            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-foreground transition-colors shadow-lg"
              title="Kembali ke Atas"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
