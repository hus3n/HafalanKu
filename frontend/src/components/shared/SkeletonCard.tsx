import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  type?: 'card' | 'list-item' | 'avatar' | 'text';
}

export function Skeleton({ className, type = 'text' }: SkeletonProps) {
  const baseClass = "bg-muted relative overflow-hidden";
  
  // Shimmer effect
  const shimmer = (
    <motion.div 
      className="absolute inset-0 bg-secondary/30"
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    />
  );

  if (type === 'avatar') {
    return (
      <div className={cn(baseClass, "rounded-full w-10 h-10 shrink-0", className)}>
        {shimmer}
      </div>
    );
  }

  if (type === 'list-item') {
    return (
      <div className={cn("flex items-center gap-4 w-full", className)}>
        <Skeleton type="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={cn("p-6 rounded-2xl border border-border bg-card space-y-4", className)}>
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
        <div className="pt-4 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    );
  }

  // default: text
  return (
    <div className={cn(baseClass, "rounded-md", className)}>
      {shimmer}
    </div>
  );
}

export function SkeletonGrid({ count = 3, className }: { count?: number, className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} type="card" />
      ))}
    </div>
  );
}
