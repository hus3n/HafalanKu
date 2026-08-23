'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Building, Users, BookOpen, Heart, Building2, CheckCircle2 } from 'lucide-react';
import { useLandingStats } from '../../hooks/useLandingStats';

export function Testimonials() {
  const { data: stats } = useLandingStats();

  const totalSantri = stats?.totalSantri || 0;
  const totalOrgs = stats?.totalOrganizations || 0;
  const totalHafalan = stats?.totalHafalan || 0;
  const organizations = stats?.organizations || [];

  return (
    <section id="testimoni" className="py-28 relative overflow-hidden bg-background">
      {/* Ambient Gradient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8 }}
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

        {/* Real Registered Organizations Grid */}
        {organizations.length > 0 && (
          <div className="space-y-6 pt-6">
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
    </section>
  );
}

