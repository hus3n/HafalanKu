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
          ? 'border-primary shadow-lg bg-secondary'
          : 'border-border opacity-60'
      )}
    >
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={() => onToggle(item.id)}
          className="p-1 rounded-full text-primary hover:scale-110 transition-transform focus:outline-none"
        >
          {item.isSelected ? (
            <CheckCircle className="w-6 h-6 text-primary fill-primary/20" />
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
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
