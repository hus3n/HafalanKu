'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MurajaahItem } from '../../hooks/useMurajaah';
import { Calendar, Flame, CheckCircle, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MurajaahCardProps {
  item: MurajaahItem;
  onToggle: (id: string) => void;
  index: number;
}

export function MurajaahCard({ item, onToggle, index }: MurajaahCardProps) {
  const isHighPriority = item.priorityScore >= 30;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        'bg-card p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 group relative overflow-hidden',
        item.isSelected
          ? 'border-[#0E8991] shadow-lg bg-[#0E8991]/5 dark:bg-[#0E8991]/15'
          : 'border-border opacity-70'
      )}
    >
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={() => onToggle(item.id)}
          className="p-1 rounded-full text-[#0E8991] dark:text-[#1bb2bd] hover:scale-110 transition-transform focus:outline-none"
        >
          {item.isSelected ? (
            <CheckCircle className="w-6 h-6 text-[#0E8991] dark:text-[#1bb2bd] fill-[#0E8991]/20" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground" />
          )}
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base text-foreground font-outfit">
              QS. {item.surahName} ({item.surahNumber})
            </h4>

            {isHighPriority && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAA27C]/20 text-[#B85828] dark:text-[#EAA27C] border border-[#EAA27C]/35">
                <Flame className="w-3 h-3 fill-[#EAA27C] text-[#EAA27C]" />
                Prioritas Tinggi
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.santri && (
              <span className="font-medium text-foreground">{item.santri.name}</span>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                Terakhir: {item.lastReviewDate ? new Date(item.lastReviewDate).toLocaleDateString('id-ID') : 'Belum pernah'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right z-10">
        <div className="text-xs text-muted-foreground">Skor Prioritas</div>
        <div className="text-lg font-bold font-mono text-primary">
          {Math.round(item.priorityScore)}
        </div>
      </div>
    </motion.div>
  );
}
