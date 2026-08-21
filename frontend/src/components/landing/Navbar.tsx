'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../shared/ThemeToggle';

import { useLandingAuth } from '../../contexts/LandingAuthContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openAuth } = useLandingAuth();

  const navLinks = [
    { label: 'Fitur Utama', href: '#fitur' },
    { label: 'Harga Paket', href: '#harga' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 transition-all"
    >
      <div className="max-w-7xl mx-auto rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl text-card-foreground px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/logo.png" alt="HafalanKu Logo" width={32} height={32} className="w-8 h-8 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
          <span className="font-outfit font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1">
            Hafalan<span className="text-[#0E8991] dark:text-[#1bb2bd]">Ku</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E8991] inline-block animate-pulse shadow-[0_0_8px_rgba(14,137,145,0.8)]" />
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ y: -2 }}
              className="text-foreground/90 hover:text-[#0E8991] dark:hover:text-[#1bb2bd] transition-colors relative py-1"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openAuth('login')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-foreground border border-border hover:bg-muted transition-all cursor-pointer"
          >
            Masuk
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openAuth('register')}
            className="px-4.5 py-2 rounded-xl bg-[#0E8991] hover:bg-[#0C737A] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-[#0E8991]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EAA27C]" /> Daftar Gratis
          </motion.button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-border text-foreground hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden mt-2 p-6 rounded-2xl border border-border bg-card dark:bg-[#0C313A] shadow-2xl text-card-foreground space-y-4 max-w-7xl mx-auto"
          >
            <nav className="flex flex-col space-y-2 font-semibold text-sm text-foreground">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth('login');
                }}
                className="w-full text-center py-3 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuth('register');
                }}
                className="w-full text-center py-3 rounded-xl bg-[#0E8991] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-[#0E8991]/20 hover:bg-[#0C737A] cursor-pointer"
              >
                Daftar Gratis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

