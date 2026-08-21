'use client';

import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Ambient Radial Aura 1 - Top Right (Ocean Teal) */}
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

      {/* Ambient Radial Aura 2 - Bottom Left (Sunset Terracotta Sand) */}
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

      {/* Ambient Subtle Center Light (Coastal Sea Foam) */}
      <motion.div
        className="absolute top-[35%] left-[30%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-[#8DB6BC]/10 dark:bg-[#0E8991]/8 blur-[100px]"
        animate={{
          transform: [
            'translate3d(0, 0, 0) scale(0.95)',
            'translate3d(35px, -20px, 0) scale(1.1)',
            'translate3d(-20px, 25px, 0) scale(0.95)',
            'translate3d(0, 0, 0) scale(0.95)',
          ],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: [0.77, 0, 0.175, 1],
          delay: 1,
        }}
      />
    </div>
  );
}
