'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, UploadCloud, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName: string;
}

export function AvatarUpload({ currentAvatarUrl, userName }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateUserInStore = useAuthStore((state) => state.updateUser);

  const handleFileChange = (file: File) => {
    setError(null);
    setSuccess(false);

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto terlalu besar. Maksimal 2 MB.');
      return;
    }

    // Validate type (JPG / PNG)
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format foto harus berupa JPG, PNG, atau WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post<{ avatarUrl: string }>('/users/profile/avatar', {
        avatarUrl: previewUrl,
      });

      if (res.success && res.data) {
        updateUserInStore({ avatarUrl: res.data.avatarUrl || previewUrl });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(res.message || 'Gagal memperbarui foto profil');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengunggah foto profil.');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl border border-border bg-card shadow-xl shadow-black/5">
      {/* Avatar Display */}
      <div className="relative group shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-primary/30 bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden shadow-lg shadow-black/5 relative">
          {displayUrl ? (
            // eslint-disable-next-next-line @next/next/no-img-element
            <img src={displayUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}

          {/* Hover Overlay */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
          >
            <Camera className="w-6 h-6" />
          </div>
        </div>

        {/* Camera Badge */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
          title="Ubah Foto Profil"
        >
          <Camera className="w-4 h-4" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Controls & Instructions */}
      <div className="space-y-3 flex-1 text-center sm:text-left">
        <div>
          <h4 className="font-semibold text-foreground text-sm font-outfit">Foto Profil</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pilih foto dengan rasio 1:1 (persegi). Ukuran maksimal 2MB (JPG, PNG, atau WebP).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl border border-input bg-background/50 text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-primary" /> Pilih Foto
          </button>

          {previewUrl && (
            <>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleUpload}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>Simpan Foto</>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setError(null);
                }}
                className="p-2 rounded-xl border border-input text-muted-foreground hover:text-foreground transition-all"
                title="Batal pilih"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Error / Success Feedback */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-500 flex items-center gap-1 mt-1 justify-center sm:justify-start"
            >
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-1 justify-center sm:justify-start"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Foto profil berhasil diperbarui!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
