'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Edit3, 
  Mail, 
  Phone, 
  Calendar, 
  Building,
  CheckCircle2,
  XCircle,
  Shield,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { UserItem, useUpdateUser } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';

interface UserTableProps {
  users: UserItem[];
  isLoading: boolean;
  onEditUser?: (user: UserItem) => void;
}

export function UserTable({ users, isLoading, onEditUser }: UserTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { mutate: updateUser } = useUpdateUser();
  const { user: currentUser } = useAuth();

  const filteredUsers = currentUser?.role === 'ADMIN'
    ? users.filter(u => u.role !== 'SUPERADMIN')
    : users;

  const handleToggleStatus = (user: UserItem) => {
    setUpdatingUserId(user.id);
    updateUser(
      {
        id: user.id,
        data: { isActive: !user.isActive },
      },
      {
        onSettled: () => {
          setUpdatingUserId(null);
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
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
              <th className="py-3.5 px-4">Pengguna</th>
              <th className="py-3.5 px-4">Kontak</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Organisasi</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Masa Aktif</th>
              <th className="py-3.5 px-4">Tanggal Buat</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-foreground">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted/60" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-muted/60 rounded" />
                        <div className="h-3 w-24 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-muted/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-20 bg-muted/60 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-muted/60 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 w-16 bg-muted/60 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-muted/60 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-8 w-16 bg-muted/60 rounded-xl ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border/40">
                      <UserIcon className="w-8 h-8 opacity-60" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Belum ada pengguna terdaftar</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Klik tombol &quot;Tambah Pengguna&quot; di atas untuk mendaftarkan staf/ustadz baru di organisasi Anda.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* User Profile Info */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {user.avatarUrl ? (
                            // eslint-disable-next-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {user.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground/70" />
                          {user.phone}
                        </span>
                      ) : (
                        <span className="opacity-40">-</span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.role === 'SUPERADMIN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <ShieldAlert className="w-3 h-3" /> Superadmin
                        </span>
                      )}
                      {user.role === 'ADMIN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Shield className="w-3 h-3" /> Admin Organisasi
                        </span>
                      )}
                      {user.role === 'USER' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <UserIcon className="w-3 h-3" /> Pengajar / Ustadz
                        </span>
                      )}
                    </td>

                    {/* Organization */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {user.organization?.name ? (
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Building className="w-3.5 h-3.5 text-primary" />
                          {user.organization.name}
                        </span>
                      ) : (
                        <span className="opacity-40">Perorangan</span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>

                    {/* Masa Aktif / Active Until */}
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      {!user.activeUntil ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Permanen</span>
                      ) : new Date(user.activeUntil) < new Date() ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Kadaluarsa ({formatDate(user.activeUntil)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {user.isTrial ? 'Trial ' : ''}s/d {formatDate(user.activeUntil)}
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit button */}
                        {onEditUser && (
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                            title="Edit Data User"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Toggle Active status button */}
                        <button
                          disabled={updatingUserId === user.id}
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user.isActive
                              ? 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                          title={user.isActive ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                        >
                          {updatingUserId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : user.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
