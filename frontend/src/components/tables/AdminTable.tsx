'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Building,
  CheckCircle2,
  XCircle,
  Shield,
  User as UserIcon,
  Loader2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { UserItem, useUpdateUser } from '../../hooks/useUsers';
import { useDeleteUser } from '../../hooks/useSuperadmin';

interface AdminTableProps {
  users: UserItem[];
  isLoading: boolean;
  onEditUser?: (user: UserItem) => void;
  onSendWhatsApp?: (user: UserItem) => void;
}

export function AdminTable({ users, isLoading, onEditUser, onSendWhatsApp }: AdminTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const { mutate: updateUser } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

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

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id, {
      onSuccess: () => {
        setDeletingUser(null);
      },
    });
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
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Pengguna Platform</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Lembaga / Organisasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4 text-right">Aksi Platform</th>
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
                      <div className="h-8 w-20 bg-muted/60 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 rounded-full bg-muted/40 text-muted-foreground border border-border/40">
                        <UserIcon className="w-8 h-8 opacity-60" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Tidak Ada Pengguna Ditemukan</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Tidak ada pengguna yang cocok dengan kriteria filter atau pencarian Anda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {users.map((user) => (
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
                            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5 font-outfit">
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
                            <UserIcon className="w-3 h-3" /> Pengajar / User
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
                          {/* Send WhatsApp Message Button */}
                          {onSendWhatsApp && (
                            <button
                              onClick={() => onSendWhatsApp(user)}
                              className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
                              title={`Kirim Pesan WhatsApp ke ${user.name}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit User Button */}
                          {onEditUser && (
                            <button
                              onClick={() => onEditUser(user)}
                              className="p-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all cursor-pointer"
                              title="Edit Pengguna"
                            >
                              <UserCheck className="w-4 h-4 opacity-0 hidden" />
                              <Shield className="w-4 h-4" /> 
                            </button>
                          )}

                          {/* Toggle Active status */}
                          <button
                            disabled={updatingUserId === user.id}
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              user.isActive
                                ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}
                            title={user.isActive ? 'Deaktivasi Pengguna' : 'Aktivasi Pengguna'}
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete User from Platform Button */}
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                            title="Hapus Pengguna Dari Platform"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-outfit text-foreground">
                    Hapus Pengguna Platform
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong> ({deletingUser.email}) secara permanen?
                  </p>
                </div>
              </div>

              {deletingUser.isActive ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    ⚠️ Akun Masih Berstatus Aktif
                  </p>
                  <p className="leading-relaxed">
                    Untuk perlindungan data, sistem hanya mengizinkan penghapusan pada akun yang telah nonaktif. Silakan nonaktifkan akun terlebih dahulu sebelum melanjutkan penghapusan.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleStatus(deletingUser);
                      setDeletingUser((prev) => prev ? { ...prev, isActive: false } : null);
                    }}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" /> Nonaktifkan Akun Ini Sekarang
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                  ⚠️ Akun telah nonaktif. Tindakan ini akan menghapus akun dan seluruh data terkait secara permanen dari basis data platform.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  disabled={isDeleting}
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting || deletingUser.isActive}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Ya, Hapus Pengguna
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
