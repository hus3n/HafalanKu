'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  UploadCloud,
  X,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Building2,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateReview, useAllReviews } from '../../hooks/useReviews';

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: 'Sangat Kurang', color: 'text-rose-500', desc: 'Banyak kendala yang dialami' },
  2: { text: 'Kurang Puas', color: 'text-amber-500', desc: 'Perlu beberapa perbaikan' },
  3: { text: 'Cukup Baik', color: 'text-yellow-500', desc: 'Sudah cukup membantu kegiatan' },
  4: { text: 'Puas & Bermanfaat', color: 'text-emerald-500', desc: 'Sangat membantu pemantauan santri' },
  5: { text: 'Sangat Puas & Berkah', color: 'text-amber-400', desc: 'Luar biasa, sangat direkomendasikan!' },
};

export default function ReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createReviewMutation = useCreateReview();
  const { data: allReviewsData } = useAllReviews(1, 6);

  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [name, setName] = useState<string>(() => user?.name || '');
  const [roleOrTitle, setRoleOrTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [prevUserName, setPrevUserName] = useState<string | undefined>(user?.name);

  // Auto-populate name if logged in
  if (user?.name && !name && user.name !== prevUserName) {
    setPrevUserName(user.name);
    setName(user.name);
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRating = hoveredRating !== null ? hoveredRating : rating;

  const handleImageChange = (file: File) => {
    setImageError(null);

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran gambar maksimal 5 MB.');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Format harus berupa JPG, PNG, atau WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!comment.trim() || comment.trim().length < 5) return;

    createReviewMutation.mutate(
      {
        name: name.trim(),
        roleOrTitle: roleOrTitle.trim() || undefined,
        rating,
        comment: comment.trim(),
        imageUrl: imagePreview || undefined,
        userAvatarUrl: user?.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-[#0E8991]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="HafalanKu Logo"
                width={30}
                height={30}
                className="w-7 h-7 object-contain drop-shadow-sm"
              />
              <span className="font-outfit font-extrabold text-lg tracking-tight text-foreground">
                Hafalan<span className="text-[#0E8991] dark:text-[#1bb2bd]">Ku</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Beranda
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/?auth=login"
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Title Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            Suara Pengguna HafalanKu
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight">
            Bagikan Ulasan & Pengalaman Anda
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
            Masukan dan pengalaman Anda sangat berharga untuk terus memajukan layanan dan ekosistem pencatatan hafalan Al-Qur&apos;an.
          </p>
        </div>

        {/* Review Form Card */}
        <div className="p-6 sm:p-10 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl shadow-black/5 relative overflow-hidden">
          {/* Subtle Corner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 sm:py-14 space-y-6 max-w-md mx-auto"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-outfit text-foreground">
                  Jazakumullah Khairan Katsiran!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ulasan dan penilaian Anda telah berhasil dicatat. Ulasan terbaru Anda juga akan ditampilkan di beranda HafalanKu.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-center"
                >
                  Lihat di Beranda
                </Link>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-border hover:bg-muted font-bold text-xs text-foreground transition-all text-center"
                  >
                    Ke Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setComment('');
                      setImagePreview(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-border hover:bg-muted font-bold text-xs text-foreground transition-all"
                  >
                    Tulis Ulasan Lain
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Star Rating Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tingkat Kepuasan Layanan <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col items-center sm:items-start gap-2.5">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= activeRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="p-1 rounded-xl hover:scale-115 transition-transform focus:outline-none cursor-pointer"
                          title={`${star} Bintang`}
                        >
                          <Star
                            className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                : 'text-muted-foreground/30 stroke-1'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Label Description */}
                  <motion.div
                    key={activeRating}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs font-semibold"
                  >
                    <span className={RATING_LABELS[activeRating].color}>
                      ★ {activeRating} dari 5 — {RATING_LABELS[activeRating].text}
                    </span>
                    <span className="text-muted-foreground font-normal hidden sm:inline">
                      ({RATING_LABELS[activeRating].desc})
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Name & Role Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Nama Anda <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="cth: Ustadz Faisal / Ibu Siti"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium outline-none transition-all shadow-inner text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    Peran / Lembaga / TPQ <span className="text-muted-foreground font-normal">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="cth: TPQ Al-Ikhlas / Wali Santri"
                      value={roleOrTitle}
                      onChange={(e) => setRoleOrTitle(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium outline-none transition-all shadow-inner text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Ulasan & Pengalaman Anda <span className="text-destructive">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {comment.length}/1500
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    minLength={5}
                    maxLength={1500}
                    placeholder="Ceritakan bagaimana kemudahan yang Anda rasakan selama menggunakan HafalanKu, fitur yang paling membantu, atau dampak positif pada setoran & murajaah santri..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-input bg-background/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm outline-none transition-all shadow-inner resize-y leading-relaxed text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  Foto / Tangkapan Layar Pendukung <span className="text-muted-foreground font-normal">(opsional)</span>
                </label>

                {imagePreview ? (
                  <div className="relative inline-block border-2 border-primary/40 rounded-2xl p-2 bg-muted/30">
                    <div className="relative w-40 h-28 sm:w-56 sm:h-36 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={imagePreview}
                        alt="Preview Ulasan"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Hapus gambar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        Klik untuk unggah foto atau tangkapan layar
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        JPG, PNG, atau WebP (maksimal 5 MB)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageChange(file);
                  }}
                />

                {imageError && (
                  <p className="text-xs text-destructive font-medium">{imageError}</p>
                )}
              </div>

              {/* Submit Error Feedback */}
              {createReviewMutation.isError && (
                <div className="p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
                  {createReviewMutation.error?.message || 'Gagal mengirim ulasan. Silakan periksa koneksi Anda.'}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={createReviewMutation.isPending || !name.trim() || comment.trim().length < 5}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0E8991] to-[#12A0AA] hover:from-[#0C737A] hover:to-[#0E8991] text-white font-extrabold text-sm shadow-xl shadow-[#0E8991]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createReviewMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Ulasan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#EAA27C]" />
                      <span>Kirim Ulasan Sekarang</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </div>

        {/* Existing Community Reviews Section */}
        {allReviewsData?.reviews && allReviewsData.reviews.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Ulasan Terbaru dari Pengguna
                </h3>
                <p className="text-xs text-muted-foreground">
                  Testimoni nyata dari ustadz, pengurus lembaga, dan wali santri
                </p>
              </div>

              {allReviewsData.averageRating && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 self-start sm:self-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Rata-rata {allReviewsData.averageRating.toFixed(1)} / 5.0</span>
                  <span className="text-muted-foreground font-normal">({allReviewsData.total} ulasan)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviewsData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-3.5 shadow-sm hover:border-primary/40 transition-colors"
                >
                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Attached Image Thumbnail */}
                  {rev.imageUrl && (
                    <div
                      onClick={() => setSelectedReviewImage(rev.imageUrl || null)}
                      className="relative w-28 h-20 rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity group"
                    >
                      <img
                        src={rev.imageUrl}
                        alt="Lampiran Ulasan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex items-center gap-2.5 pt-1 border-t border-border/40">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-primary/20">
                      {rev.userAvatarUrl ? (
                        <img src={rev.userAvatarUrl} alt={rev.name} className="w-full h-full object-cover" />
                      ) : (
                        rev.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{rev.name}</p>
                      {rev.roleOrTitle && (
                        <p className="text-[11px] text-muted-foreground truncate">{rev.roleOrTitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedReviewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
            >
              <button
                onClick={() => setSelectedReviewImage(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedReviewImage}
                alt="Lampiran Ulasan"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
