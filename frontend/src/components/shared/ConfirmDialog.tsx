'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-500" />,
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25',
    },
    primary: {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      iconBg: 'bg-primary/10 border-primary/20',
      btn: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25',
    },
  };

  const style = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={!isLoading ? onCancel : undefined}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-start gap-4">
                <div className={cn("p-3 rounded-2xl border shrink-0", style.iconBg)}>
                  {style.icon}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold font-outfit text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {description}
                  </p>
                </div>
                <button 
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1.5 rounded-xl hover:bg-secondary text-muted-foreground transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-muted/30 border-t border-border/40 flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-secondary border border-transparent hover:border-input transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center gap-2",
                    style.btn,
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? <LoadingSpinner size="sm" variant="white" /> : null}
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
