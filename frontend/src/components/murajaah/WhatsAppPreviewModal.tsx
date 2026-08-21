'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SendWhatsAppResponse } from '../../hooks/useMurajaah';
import { X, Send, Copy, Check, MessageSquare } from 'lucide-react';

interface WhatsAppPreviewModalProps {
  data: SendWhatsAppResponse | null;
  onClose: () => void;
}

export function WhatsAppPreviewModal({ data, onClose }: WhatsAppPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.messagePreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(data.messagePreview);
    // Clean phone number
    const cleanPhone = data.recipientPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-card p-6 rounded-2xl max-w-lg w-full border border-emerald-500/30 shadow-2xl pointer-events-auto space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2 text-[#0E8991] dark:text-[#1bb2bd]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-lg font-bold font-outfit text-foreground">
                Pratinjau Pesan WhatsApp
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info penerima */}
          <div className="bg-[#0E8991]/10 border border-[#0E8991]/20 p-3 rounded-xl text-xs space-y-1 text-foreground">
            <p>
              <span className="font-bold text-[#0E8991] dark:text-[#1bb2bd]">Penerima:</span> {data.parentName} (Wali dari {data.santriName})
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              <span className="font-bold text-[#0E8991] dark:text-[#1bb2bd]">No. WA:</span> {data.recipientPhone} (Terenkripsi AES-256)
            </p>
          </div>

          {/* Textarea preview */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Isi Pesan:</label>
            <div className="p-4 rounded-xl bg-background/60 border border-input text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto text-foreground">
              {data.messagePreview}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 h-11 rounded-xl border border-input bg-background/50 text-xs font-medium hover:bg-secondary transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 h-11 rounded-xl bg-[#0E8991] hover:bg-[#0C737A] text-white text-xs font-bold shadow-lg shadow-[#0E8991]/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
