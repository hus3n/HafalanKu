import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <FileSearch className="w-12 h-12 text-muted-foreground/50" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl border border-dashed border-border bg-card/20 backdrop-blur-sm",
        className
      )}
    >
      <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6 shadow-inner relative group">
        {/* Subtle Pulse background */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-primary/10 -z-10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        {icon}
      </div>
      
      <h3 className="text-xl font-bold font-outfit text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
