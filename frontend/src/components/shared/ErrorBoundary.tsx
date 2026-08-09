'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl flex flex-col items-center text-center shadow-lg shadow-rose-500/10"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
              <AlertOctagon className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold font-outfit text-foreground mb-3">
              Terjadi Kesalahan
            </h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              Maaf, ada sesuatu yang salah pada komponen ini. Silakan muat ulang halaman.
              {this.state.error && (
                <span className="block mt-2 text-xs font-mono text-rose-500/80 bg-rose-500/10 p-2 rounded-lg text-left overflow-hidden text-ellipsis">
                  {this.state.error.message}
                </span>
              )}
            </p>

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
            >
              <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
