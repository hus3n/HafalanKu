'use client';

import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, KeyRound, Building, Mail, Phone, Calendar } from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { AvatarUpload } from '../../../components/shared/AvatarUpload';
import { ProfileForm } from '../../../components/forms/ProfileForm';
import { ChangePasswordForm } from '../../../components/forms/ChangePasswordForm';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          Profil Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola foto profil, informasi pribadi, nomor kontak WhatsApp, dan kata sandi akun Anda.
        </p>
      </div>

      {/* User Overview Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-8 rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-20 h-20 rounded-full border-2 border-primary/30 bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-md">
            {user?.avatarUrl ? (
              // eslint-disable-next-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              (user?.name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2 justify-center md:justify-start">
              {user?.name || 'Pengguna HafalanKu'}
            </h2>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {user.phone}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/20 text-primary border border-primary/30">
                <Shield className="w-3 h-3" />
                {user?.role === 'SUPERADMIN'
                  ? 'Superadmin'
                  : user?.role === 'ADMIN'
                  ? 'Admin Organisasi'
                  : 'Pengajar / User'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border/40">
                <Building className="w-3 h-3 text-muted-foreground" />
                {user?.organization?.name || 'Perorangan'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6 text-center md:text-right shrink-0">
          <span className="block opacity-70">Terdaftar Sejak:</span>
          <span className="font-semibold text-foreground flex items-center gap-1 justify-center md:justify-end mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {formatDate(user?.createdAt)}
          </span>
        </div>
      </motion.div>

      {/* Section 1: Avatar Upload */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Foto Profil & Avatar
        </h3>
        <AvatarUpload currentAvatarUrl={user?.avatarUrl} userName={user?.name || 'User'} />
      </div>

      {/* Section 2: Profile Form */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
          <Building className="w-4 h-4 text-primary" /> Informasi Pribadi & Kontak
        </h3>
        <div className="p-6 md:p-8 rounded-3xl border border-border bg-card shadow-xl shadow-black/5">
          <ProfileForm />
        </div>
      </div>

      {/* Section 3: Change Password Form */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-outfit text-foreground flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> Keamanan & Kata Sandi
        </h3>
        <div className="p-6 md:p-8 rounded-3xl border border-border bg-card shadow-xl shadow-black/5">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
