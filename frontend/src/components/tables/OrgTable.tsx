'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building, Shield, Users, Calendar } from 'lucide-react';
import { OrganizationItem } from '../../hooks/useSuperadmin';

interface OrgTableProps {
  organizations: OrganizationItem[];
  isLoading: boolean;
}

export function OrgTable({ organizations, isLoading }: OrgTableProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg shadow-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Nama Lembaga / Organisasi</th>
              <th className="py-3.5 px-4">Total Admin</th>
              <th className="py-3.5 px-4">Total Pengajar</th>
              <th className="py-3.5 px-4">Total Anggota</th>
              <th className="py-3.5 px-4 text-right">Tanggal Terdaftar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-foreground">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-40 bg-muted/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-muted/60 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-muted/60 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-12 bg-muted/60 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-24 bg-muted/60 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border/40">
                      <Building className="w-8 h-8 opacity-60" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum Ada Organisasi Terdaftar</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Organisasi akan otomatis terbentuk saat pendaftaran akun kategori Lembaga/Pesantren.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {organizations.map((org) => {
                  const totalMembers = org.totalAdmins + org.totalUsers;

                  return (
                    <motion.tr
                      key={org.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Organization Name */}
                      <td className="py-3.5 px-4 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-foreground text-sm block font-outfit">{org.name}</span>
                            <span className="text-[11px] font-mono text-muted-foreground opacity-70">
                              ID: {org.id.substring(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Admins */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Shield className="w-3 h-3" /> {org.totalAdmins} Admin
                        </span>
                      </td>

                      {/* Total Users / Teachers */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Users className="w-3 h-3" /> {org.totalUsers} Pengajar
                        </span>
                      </td>

                      {/* Total Members */}
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-foreground">
                        {totalMembers} Akun
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                          {formatDate(org.createdAt)}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
