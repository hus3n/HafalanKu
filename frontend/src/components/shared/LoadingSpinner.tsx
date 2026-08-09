import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'muted';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  const borderSizeMap = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4',
  };

  const variantMap = {
    primary: 'border-primary/30 border-t-primary',
    white: 'border-white/30 border-t-white',
    muted: 'border-muted border-t-foreground/50',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        className={cn(
          'rounded-full',
          sizeMap[size],
          borderSizeMap[size],
          variantMap[variant]
        )}
      />
      {text && (
        <motion.p 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", repeatType: "reverse" }}
          className={cn(
            'text-sm font-medium animate-pulse',
            variant === 'white' ? 'text-white' : 'text-muted-foreground'
          )}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl">
        {spinner}
      </div>
    );
  }

  return spinner;
}
