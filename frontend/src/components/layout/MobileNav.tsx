'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Close nav automatically whenever pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 rounded-md text-primary-foreground hover:bg-black/10 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] h-full bg-[#091c15] dark:bg-[#06140e] text-white border-r border-emerald-500/20 shadow-2xl z-50 flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white p-1.5 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-md">
                    <Image src="/logo.png" alt="HafalanKu Logo" width={28} height={28} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <h1 className="text-2xl font-extrabold font-outfit text-white tracking-tight">
                      Hafalan<span className="text-emerald-400">Ku</span>
                    </h1>
                  </Link>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
                <SidebarMenu isMobile={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
