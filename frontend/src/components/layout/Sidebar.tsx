'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarMenu } from './SidebarMenu';
import { useSidebarStore } from '../../stores/sidebarStore';

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
  const { isCollapsed, toggleCollapsed } = useSidebarStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-emerald-500/15 bg-[#091c15] dark:bg-[#06140e] text-white z-40 overflow-hidden shadow-2xl"
    >
      <div className="h-full flex flex-col p-4 relative">
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-2 mb-6 border-b border-white/10 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-md">
              <Image src="/logo.png" alt="HafalanKu Logo" width={28} height={28} className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-extrabold font-outfit text-white tracking-tight whitespace-nowrap"
              >
                Hafalan<span className="text-emerald-400">Ku</span>
              </motion.span>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10 cursor-pointer shrink-0"
              title="Mengecilkan Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-1">
          <SidebarMenu isCollapsed={isCollapsed} />
        </div>

        {/* Collapse Toggle Footer & Version */}
        <div className="pt-4 mt-auto border-t border-white/10 flex flex-col gap-3">
          {isCollapsed ? (
            <button
              onClick={toggleCollapsed}
              className="w-10 h-10 mx-auto rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-white flex items-center justify-center transition-all border border-emerald-500/30 cursor-pointer"
              title="Memperbesar Sidebar"
            >
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </button>
          ) : (
            <div className="flex items-center justify-between px-2">
              <p className="text-[11px] font-semibold text-white/60">
                &copy; 2026 HafalanKu v2.0
              </p>
              <button
                onClick={toggleCollapsed}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10 cursor-pointer"
                title="Mengecilkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
