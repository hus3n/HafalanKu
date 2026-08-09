'use client';

import React from 'react';
import { Toaster, toast, ToastOptions } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: '!p-0 !bg-transparent !shadow-none !max-w-md',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
}

interface CustomToastProps {
  t: any;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const CustomToast = ({ t, title, message, type }: CustomToastProps) => {
  const styles = {
    success: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      title: 'text-emerald-500',
    },
    error: {
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      title: 'text-rose-500',
    },
    info: {
      border: 'border-sky-500/20',
      bg: 'bg-sky-500/5',
      icon: <Info className="w-5 h-5 text-sky-500" />,
      title: 'text-sky-500',
    },
    warning: {
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      title: 'text-amber-500',
    },
  };

  const style = styles[type];

  return (
    <div
      className={cn(
        "flex p-4 gap-3 rounded-2xl border backdrop-blur-2xl shadow-xl shadow-black/5 min-w-[300px]",
        style.border,
        style.bg,
        t.visible ? "animate-in slide-in-from-top-2 fade-in" : "animate-out slide-out-to-top-2 fade-out"
      )}
    >
      <div className="shrink-0 pt-0.5">{style.icon}</div>
      <div className="flex-1 space-y-1">
        <h4 className={cn("text-sm font-bold font-outfit", style.title)}>{title}</h4>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
      <button 
        onClick={() => toast.dismiss(t.id)}
        className="shrink-0 p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground self-start transition-colors"
      >
        &times;
      </button>
    </div>
  );
};

// Custom toast launcher
export const notify = {
  success: (title: string, message?: string, options?: ToastOptions) => 
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="success" />, options),
  
  error: (title: string, message?: string, options?: ToastOptions) => 
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="error" />, options),
  
  info: (title: string, message?: string, options?: ToastOptions) => 
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="info" />, options),
  
  warning: (title: string, message?: string, options?: ToastOptions) => 
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="warning" />, options),
    
  dismiss: toast.dismiss,
};
