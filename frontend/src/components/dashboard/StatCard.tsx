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

// Distinct solid colors per index to ensure high visual contrast
const badgeStyles = [
  "bg-emerald-600 shadow-emerald-600/20",
  "bg-teal-600 shadow-teal-600/20",
  "bg-indigo-600 shadow-indigo-600/20",
  "bg-amber-600 shadow-amber-600/20",
  "bg-rose-600 shadow-rose-600/20",
  "bg-cyan-600 shadow-cyan-600/20",
];

export function StatCard({ stat, index }: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, stat.value, {
      duration: 1.2,
      ease: 'easeOut',
      delay: index * 0.1,
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
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card p-6 rounded-3xl border border-border shadow-md hover:shadow-xl transition-shadow flex items-center justify-between group relative overflow-hidden"
    >
      <div className="space-y-1.5 z-10">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {stat.label}
        </p>
        <div className="text-3xl font-extrabold font-outfit text-foreground tracking-tight">
          {displayValue}
        </div>
      </div>

      <div className={`w-12 h-12 rounded-2xl ${badgeColor} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 z-10 shrink-0`}>
        {iconMap[stat.icon] || <BookOpen className="w-5 h-5 text-white" />}
      </div>
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border animate-pulse flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-3 bg-muted/60 rounded w-1/2" />
        <div className="h-8 bg-muted/80 rounded w-1/3" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-muted/60" />
    </div>
  );
}
