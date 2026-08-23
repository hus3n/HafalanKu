'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  UserPlus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  AlertCircle,
  X,
  Building
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useUsers, useUpdateUser, UserItem, UpdateUserInput } from '../../../hooks/useUsers';
import { UserTable } from '../../../components/tables/UserTable';
import { UserForm } from '../../../components/forms/UserForm';
import { SendWhatsAppModal } from '../../../components/modals/SendWhatsAppModal';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [whatsappUser, setWhatsappUser] = useState<UserItem | null>(null);

  const isAuthorized = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';

  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search,
  });

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const handleUpdateUserSubmit = (formData: UpdateUserInput) => {
    if (!editingUser) return;
    updateUser(
      { id: editingUser.id, data: formData },
      {
        onSuccess: () => {
          setEditingUser(null);
        },
      }
    );
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-2xl text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="p-4 rounded-full bg-rose-500/20 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Halaman Manajemen Pengguna ini hanya dapat diakses oleh akun berkewenangan <strong>Admin Organisasi</strong> atau <strong>Superadmin</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Manajemen Pengguna Organisasi
            </h1>
            {currentUser?.organization?.name && (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {currentUser.organization.name}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-primary" />
            Kelola staf, ustadz, dan admin yang terdaftar di lembaga/organisasi Anda.
          </p>
        </div>

        <Link href="/admin/tambah-user">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Tambah User Baru
          </motion.button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* User Data Table */}
      <UserTable
        users={data?.data || []}
        isLoading={isLoading}
        onEditUser={(user) => setEditingUser(user)}
        onSendWhatsApp={(user) => setWhatsappUser(user)}
      />

      {/* Pagination Controls */}
      {data?.meta && (data.meta.totalPages || 0) > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{data?.data?.length || 0}</span> dari{' '}
            <span className="font-semibold text-foreground">{data?.meta?.total || 0}</span> pengguna
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-input bg-background/50 text-muted-foreground disabled:opacity-40 hover:bg-secondary transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground px-2">
              {page} / {data.meta.totalPages}
            </span>
            <button
              disabled={page >= (data.meta.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-input bg-background/50 text-muted-foreground disabled:opacity-40 hover:bg-secondary transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal Dialog */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] my-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-outfit text-foreground">
                      Edit Data Pengguna
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Perbarui informasi atau role dari <strong>{editingUser.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 pt-4 custom-scrollbar">
                <UserForm
                  initialData={editingUser}
                  onSubmitUpdate={handleUpdateUserSubmit}
                  isPending={isUpdating}
                  onCancel={() => setEditingUser(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send WhatsApp Message Modal */}
      <SendWhatsAppModal
        user={whatsappUser}
        isOpen={!!whatsappUser}
        onClose={() => setWhatsappUser(null)}
      />
    </div>
  );
}
