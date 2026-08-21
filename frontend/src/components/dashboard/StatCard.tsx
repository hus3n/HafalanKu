'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import {
  Users, 
  GraduationCap, 
  Building, 
  BookOpen, 
  History, 
  Shield, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Bell, 
  TrendingUp, 
  Star, 
  Layers, 
  Activity
} from 'lucide-react';
import { StatItem } from '../../hooks/useDashboard';

interface StatCardProps {
  stat: StatItem;
  index: number;
}

const iconMap: Record<string, React.ReactNode> = {
  'users': <Users className="w-5 h-5 text-white" />,
  'graduation-cap': <GraduationCap className="w-5 h-5 text-white" />,
  'building': <Building className="w-5 h-5 text-white" />,
  'book-open': <BookOpen className="w-5 h-5 text-white" />,
  'history': <History className="w-5 h-5 text-white" />,
  'shield': <Shield className="w-5 h-5 text-white" />,
  'calendar': <Calendar className="w-5 h-5 text-white" />,
  'check-circle': <CheckCircle className="w-5 h-5 text-white" />,
  'check': <CheckCircle className="w-5 h-5 text-white" />,
  'file-text': <FileText className="w-5 h-5 text-white" />,
  'bell': <Bell className="w-5 h-5 text-white" />,
  'trending-up': <TrendingUp className="w-5 h-5 text-white" />,
  'star': <Star className="w-5 h-5 text-white" />,
  'layers': <Layers className="w-5 h-5 text-white" />,
  'activity': <Activity className="w-5 h-5 text-white" />,
};

const badgeStyles = [
  "bg-[#0E8991] text-white shadow-[#0E8991]/30",
  "bg-[#D97746] text-white shadow-[#D97746]/30",
  "bg-[#0E8991]/85 text-white shadow-[#0E8991]/30",
  "bg-[#C46838] text-white shadow-[#C46838]/30",
  "bg-[#0C313A] text-white shadow-[#0C313A]/40",
  "bg-[#12a4ae] text-white shadow-[#12a4ae]/30",
];

export function StatCard({ stat, index }: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, stat.value, {
      duration: 0.9,
      ease: [0.23, 1, 0.32, 1],
      delay: index * 0.05,
    });

    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [stat.value, index, count, rounded]);

  const badgeColor = badgeStyles[index % badgeStyles.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="bg-card dark:bg-[#0C313A] p-5 sm:p-6 rounded-3xl border border-border dark:border-[#0E8991]/20 shadow-md hover:shadow-xl transition-all flex items-center justify-between group relative overflow-hidden"
    >
      <div className="space-y-1 z-10">
        <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {stat.label}
        </p>
        <div className="text-2xl sm:text-3xl font-extrabold font-outfit text-foreground tracking-tight">
          {displayValue}
        </div>
      </div>

      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${badgeColor} flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-200 z-10 shrink-0 border border-white/10`}>
        {iconMap[stat.icon] || <BookOpen className="w-5 h-5 text-white" />}
      </div>
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-3xl border border-border/80 animate-pulse flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-3.5 bg-muted/60 rounded-md w-1/2" />
        <div className="h-8 bg-muted/80 rounded-md w-1/3" />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-muted/60" />
    </div>
  );
}
