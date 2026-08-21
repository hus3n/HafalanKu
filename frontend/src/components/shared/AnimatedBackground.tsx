'use client';

import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Desktop Light Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 dark:hidden hidden md:block transition-opacity duration-700"
        style={{ backgroundImage: "url('/backgrounds/bg-light-desktop.jpg')" }}
      />

      {/* 2. Mobile Light Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 dark:hidden block md:hidden transition-opacity duration-700"
        style={{ backgroundImage: "url('/backgrounds/bg-light-mobile.jpg')" }}
      />

      {/* 3. Desktop Dark Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 hidden dark:md:block transition-opacity duration-700"
        style={{ backgroundImage: "url('/backgrounds/bg-dark-desktop.jpg')" }}
      />

      {/* 4. Mobile Dark Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 hidden dark:max-md:block transition-opacity duration-700"
        style={{ backgroundImage: "url('/backgrounds/bg-dark-mobile.jpg')" }}
      />

      {/* 5. Ambient Vignette Gradient Overlay for Text & Card Clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background/85 dark:from-background/40 dark:via-background/65 dark:to-background/90 transition-colors duration-500" />

      {/* 6. Ambient Radial Aura 1 - Top Right (Ocean Teal) */}
      <motion.div
        className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-[#0E8991]/15 via-[#0E8991]/8 to-transparent blur-[110px]"
        animate={{
          transform: [
            'translate3d(0, 0, 0) scale(1)',
            'translate3d(25px, -35px, 0) scale(1.05)',
            'translate3d(0, 0, 0) scale(1)',
          ],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: [0.77, 0, 0.175, 1],
        }}
      />

      {/* 7. Ambient Radial Aura 2 - Bottom Left (Sunset Terracotta Sand) */}
      <motion.div
        className="absolute bottom-[-20%] left-[-15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-[#EAA27C]/15 via-[#E8BBA6]/10 to-transparent blur-[130px]"
        animate={{
          transform: [
            'translate3d(0, 0, 0) scale(1)',
            'translate3d(-30px, 40px, 0) scale(1.08)',
            'translate3d(0, 0, 0) scale(1)',
          ],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: [0.77, 0, 0.175, 1],
          delay: 2,
        }}
      />
    </div>
  );
}
