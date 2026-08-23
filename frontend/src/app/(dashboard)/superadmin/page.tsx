'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Building, 
  Users, 
  Filter
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useSuperadminUsers, useSuperadminOrgs } from '../../../hooks/useSuperadmin';
import { AdminTable } from '../../../components/tables/AdminTable';
import { OrgTable } from '../../../components/tables/OrgTable';
import { UserForm } from '../../../components/forms/UserForm';
import { SendWhatsAppModal } from '../../../components/modals/SendWhatsAppModal';
import { useUpdateUser, UpdateUserInput, UserItem } from '../../../hooks/useUsers';
import { AlertCircle, X } from 'lucide-react';

export default function SuperadminPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'orgs'>('users');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [whatsappUser, setWhatsappUser] = useState<UserItem | null>(null);

  const isSuperadmin = currentUser?.role === 'SUPERADMIN';

  const { data: usersData, isLoading: isLoadingUsers } = useSuperadminUsers({
    page,
    limit: 10,
    search,
    role: roleFilter,
    status: statusFilter,
  });

  const { data: orgsData = [], isLoading: isLoadingOrgs } = useSuperadminOrgs();
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

  if (!isSuperadmin) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-2xl text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="p-4 rounded-full bg-rose-500/20 text-rose-500 w-16 h-16 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-outfit text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Halaman Superadmin ini hanya dapat diakses oleh akun dengan wewenang tertinggi (<strong>SUPERADMIN</strong>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-purple-500" />
          Superadmin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kontrol penuh atas seluruh organisasi, akun admin, dan pengguna di seluruh platform HafalanKu.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center border-b border-border/40 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === 'users'
              ? 'border-purple-500 text-purple-500 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pengguna Platform ({usersData?.data?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('orgs')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all relative ${
            activeTab === 'orgs'
              ? 'border-purple-500 text-purple-500 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Lembaga & Organisasi ({orgsData?.length || 0})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users' ? (
        <motion.div
          key="users-tab"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau email pengguna..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative w-full sm:w-48">
              <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer appearance-none"
              >
                <option value="">Semua Role</option>
                <option value="SUPERADMIN">Superadmin</option>
                <option value="ADMIN">Admin Organisasi</option>
                <option value="USER">Pengajar / User</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-48">
              <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif (ACTIVE)</option>
                <option value="INACTIVE">Nonaktif (INACTIVE)</option>
              </select>
            </div>
          </div>

          {/* Admin / User Table */}
          <AdminTable 
            users={usersData?.data || []} 
            isLoading={isLoadingUsers} 
            onEditUser={(user) => setEditingUser(user)}
            onSendWhatsApp={(user) => setWhatsappUser(user)}
          />

          {/* Pagination Controls */}
          {usersData?.meta && (usersData.meta.totalPages || 0) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{usersData?.data?.length || 0}</span> dari{' '}
                <span className="font-semibold text-foreground">{usersData?.meta?.total || 0}</span> pengguna
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
                  {page} / {usersData.meta.totalPages}
                </span>
                <button
                  disabled={page >= (usersData.meta.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-input bg-background/50 text-muted-foreground disabled:opacity-40 hover:bg-secondary transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="orgs-tab"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <OrgTable organizations={orgsData} isLoading={isLoadingOrgs} />
        </motion.div>
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
                  organizations={orgsData}
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
