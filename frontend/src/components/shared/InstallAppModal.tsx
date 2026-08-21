'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Monitor, 
  Smartphone, 
  Apple, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { deferredPrompt, isStandalone, triggerInstall, openStandaloneWindow } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'DESKTOP' | 'ANDROID' | 'IOS'>('DESKTOP');
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const res = await triggerInstall();
      if (res === 'ACCEPTED') {
        onClose();
      }
    } catch (e) {
      console.error('Error triggering PWA install:', e);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-card text-card-foreground p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-border p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/icon-192x192.png" alt="HafalanKu Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                  Mode Aplikasi (Tanpa Tab)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gunakan HafalanKu dalam jendela aplikasi mandiri bebas gangguan tab browser.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Banner */}
          {deferredPrompt ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs space-y-0.5 text-center sm:text-left">
                <p className="font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Siap Dipasang Langsung
                </p>
                <p className="text-muted-foreground">Browser Anda mendukung instalasi 1-klik.</p>
              </div>
              <button
                type="button"
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-secondary/60 border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs space-y-0.5 text-center sm:text-left">
                <p className="font-bold text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Monitor className="w-4 h-4 text-emerald-500" /> Buka di Jendela Mandiri
                </p>
                <p className="text-muted-foreground">Jalankan di jendela desktop terpisah tanpa tab.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  openStandaloneWindow();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Jendela Baru</span>
              </button>
            </div>
          )}

          {/* OS Selector Tabs */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Panduan Pemasangan Sesuai Perangkat:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('DESKTOP')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  activeTab === 'DESKTOP'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ANDROID')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  activeTab === 'ANDROID'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('IOS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  activeTab === 'IOS'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border/50'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs space-y-3 leading-relaxed">
              {activeTab === 'DESKTOP' && (
                <div className="space-y-2 text-foreground/90">
                  <p className="font-bold text-foreground">Di Google Chrome / Microsoft Edge / Brave:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Perhatikan ujung kanan <strong>Address Bar (kolom URL)</strong> browser Anda.</li>
                    <li>Klik ikon <strong>Install / Pasang Aplikasi (📥)</strong> atau ikon monitor komputer.</li>
                    <li>Atau klik menu titik tiga <strong>(⋮)</strong> &rarr; <strong>Simpan dan Bagikan / Aplikasi</strong> &rarr; Pilih <strong>"Install HafalanKu"</strong>.</li>
                    <li>Aplikasi akan otomatis muncul di Desktop & Taskbar tanpa bilah tab browser!</li>
                  </ol>
                </div>
              )}

              {activeTab === 'ANDROID' && (
                <div className="space-y-2 text-foreground/90">
                  <p className="font-bold text-foreground">Di Google Chrome Android:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Buka menu titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.</li>
                    <li>Pilih menu <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong> atau <strong>"Install Aplikasi"</strong>.</li>
                    <li>Tekan <strong>Install / Tambah</strong>. Ikon HafalanKu akan terpasang di menu HP Anda layaknya aplikasi asli Play Store.</li>
                  </ol>
                </div>
              )}

              {activeTab === 'IOS' && (
                <div className="space-y-2 text-foreground/90">
                  <p className="font-bold text-foreground">Di Safari iPhone / iPad:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                    <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
                    <li>Tekan tombol <strong>Bagikan / Share (ikon kotak dengan panah ke atas ⬆️)</strong> di bar bagian bawah.</li>
                    <li>Gulir menu ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen ➕)</strong>.</li>
                    <li>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Buka dari Home Screen untuk tampilan layar penuh tanpa tab.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Ringan & Hemat Kuota (PWA)
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
