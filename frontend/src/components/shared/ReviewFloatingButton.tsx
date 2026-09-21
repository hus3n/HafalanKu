'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';

export function ReviewFloatingButton() {
  const pathname = usePathname();

  // Do not show button if user is already on the review page
  if (pathname === '/review' || pathname === '/ulasan') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href="/review"
          className="group relative flex items-center gap-2 rounded-full border border-amber-500/40 bg-card/95 dark:bg-[#0C313A]/95 backdrop-blur-xl px-3.5 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 text-foreground shadow-lg shadow-black/10 dark:shadow-2xl dark:shadow-black/50 hover:border-amber-500 hover:shadow-amber-500/15 transition-all cursor-pointer select-none"
          title="Beri Ulasan Layanan HafalanKu"
        >
          {/* Subtle Ambient Pulse Glow */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 pointer-events-none" />

          {/* Star Icon */}
          <div className="relative flex items-center justify-center">
            <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-[#EAA27C] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Label Text Responsive */}
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] sm:text-xs md:text-sm font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              <span className="sm:hidden">Ulasan</span>
              <span className="hidden sm:inline">Beri Ulasan</span>
            </span>
            <span className="text-[9px] text-muted-foreground font-medium hidden md:inline">
              Kepuasan Layanan
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
