'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10" />;
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 shadow-sm cursor-pointer overflow-hidden shrink-0"
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 90,
          scale: isDark ? 1 : 0.95,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="absolute flex items-center justify-center pointer-events-none"
      >
        <Moon className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -90 : 0,
          scale: isDark ? 0.95 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="absolute flex items-center justify-center pointer-events-none"
      >
        <Sun className="w-4 h-4 md:w-4.5 md:h-4.5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
      </motion.div>
    </motion.button>
  );
}
