'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building,
  Users,
  BookOpen,
  Heart,
  Building2,
  CheckCircle2,
  Star,
  MessageSquareQuote,
  ArrowRight,
  Sparkles,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { useLandingStats } from '../../hooks/useLandingStats';
import { useLatestReviews, ReviewItem } from '../../hooks/useReviews';

export function Testimonials() {
  const { data: stats } = useLandingStats();
  const { data: latestReviews, isLoading: isLoadingReviews } = useLatestReviews();

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const totalSantri = stats?.totalSantri || 0;
  const totalOrgs = stats?.totalOrganizations || 0;
  const totalHafalan = stats?.totalHafalan || 0;
  const organizations = stats?.organizations || [];

  return (
    <section id="testimoni" className="py-24 sm:py-28 relative overflow-hidden bg-background">
      {/* Ambient Gradient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Heart className="w-4 h-4 fill-emerald-500" /> Data Nyata Platform HafalanKu
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit text-foreground tracking-tight">
            Lembaga & Ekosistem Tahfidz
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
            Data statistik riil yang tercatat langsung di dalam basis data sistem kami tanpa rekayasa.
          </p>
        </motion.div>

        {/* Real Dynamic Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-foreground">
              {totalOrgs.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lembaga / TPQ Terdaftar
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EAA27C]/15 text-[#EAA27C] mx-auto flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-foreground">
              {totalSantri.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Santri Aktif Terdata
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm text-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-outfit text-foreground">
              {totalHafalan.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Setoran Hafalan Tercatat
            </div>
          </motion.div>
        </div>

        {/* 3 Latest Reviews Section */}
        <div className="space-y-10 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              Ulasan Pengguna Terbaru
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit text-foreground tracking-tight">
              Apa Kata Mereka Tentang HafalanKu?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pengalaman langsung ustadz, wali santri, dan pengelola lembaga tahfidz yang merasakan kemudahan sistem kami.
            </p>
          </motion.div>

          {/* 3 Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(latestReviews && latestReviews.length > 0 ? latestReviews : []).map((rev, idx) => (
              <motion.div
                key={rev.id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-md flex flex-col justify-between space-y-5 hover:border-primary/50 transition-all group relative"
              >
                {/* Top: Stars & Quote Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-6 h-6 text-primary/30 group-hover:text-primary/60 transition-colors shrink-0" />
                </div>

                {/* Review Body */}
                <div className="space-y-4 flex-1">
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                    "{rev.comment}"
                  </p>

                  {/* Attached Image if exists */}
                  {rev.imageUrl && (
                    <div
                      onClick={() => setPreviewImage(rev.imageUrl || null)}
                      className="relative w-full h-36 rounded-2xl overflow-hidden border border-border bg-muted/30 cursor-pointer group/img"
                    >
                      <img
                        src={rev.imageUrl}
                        alt="Foto Ulasan"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                        <ImageIcon className="w-4 h-4" />
                        <span>Perbesar Foto</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom: Reviewer Profile */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-primary/20">
                    {rev.userAvatarUrl ? (
                      <img src={rev.userAvatarUrl} alt={rev.name} className="w-full h-full object-cover" />
                    ) : (
                      rev.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {rev.name}
                    </div>
                    {rev.roleOrTitle && (
                      <div className="text-[11px] text-muted-foreground truncate">
                        {rev.roleOrTitle}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner to Give Review */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-[#EAA27C]/10 border border-primary/25"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5 text-[#EAA27C]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Punya Pengalaman Menarik dengan HafalanKu?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Bantu sesama ustadz dan lembaga tahfidz dengan membagikan ulasan Anda di sini.
                </p>
              </div>
            </div>

            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0E8991] hover:bg-[#0C737A] text-white font-bold text-xs shadow-lg shadow-[#0E8991]/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Tulis Ulasan Anda</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EAA27C]" />
            </Link>
          </motion.div>
        </div>

        {/* Real Registered Organizations Grid */}
        {organizations.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold font-outfit text-foreground flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Lembaga & Komunitas Tahfidz yang Telah Bergabung
              </h3>
              <p className="text-xs text-muted-foreground">
                Dipercaya oleh pengurus lembaga tahfidz, pondok pesantren, dan TPQ di berbagai daerah
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="px-4 py-2.5 rounded-2xl bg-muted/40 border border-border/60 text-xs font-medium text-foreground flex items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{org.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
            >
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewImage}
                alt="Foto Ulasan"
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
