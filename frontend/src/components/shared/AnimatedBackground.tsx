'use client';

import React from 'react';
import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Ambient Radial Aura 1 - Top Right */}
      <motion.div
        className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-emerald-500/12 via-teal-500/8 to-transparent blur-[110px]"
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

      {/* Ambient Radial Aura 2 - Bottom Left */}
      <motion.div
        className="absolute bottom-[-20%] left-[-15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-emerald-600/10 via-emerald-800/6 to-transparent blur-[130px]"
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

      {/* Ambient Subtle Center Light */}
      <motion.div
        className="absolute top-[35%] left-[30%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-teal-400/5 dark:bg-emerald-400/4 blur-[100px]"
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
