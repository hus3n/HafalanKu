'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { User, Mail, Lock, Phone, Shield, Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { UserItem, CreateUserInput, UpdateUserInput } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';

const createUserFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['ADMIN', 'USER']),
  phone: z.string().min(10, 'Nomor WhatsApp / HP tidak valid (minimal 10 digit)'),
  organizationName: z.string().optional(),
  organizationId: z.string().nullable().optional(),
  trialOption: z.string().optional(),
});

const updateUserFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'USER']),
  isActive: z.boolean(),
  phone: z.string().optional(), // Di update, phone opsional jika hanya update sebagian, tapi kalau update profile disarankan ada
  organizationName: z.string().optional(),
  organizationId: z.string().nullable().optional(),
});

type CreateFormData = z.infer<typeof createUserFormSchema>;
type UpdateFormData = z.infer<typeof updateUserFormSchema>;

interface UserFormProps {
  initialData?: UserItem | null;
  onSubmitCreate?: (data: CreateUserInput) => void;
  onSubmitUpdate?: (data: UpdateUserInput) => void;
  isPending?: boolean;
  onCancel?: () => void;
  organizations?: { id: string; name: string }[];
}

export function UserForm({ initialData, onSubmitCreate, onSubmitUpdate, isPending, onCancel, organizations }: UserFormProps) {
  const { user: currentUser } = useAuth();
  const isEdit = !!initialData;

  const createForm = useForm<CreateFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      role: (initialData?.role as any) || 'USER',
      phone: initialData?.phone || '',
      organizationName: initialData?.organization?.name || currentUser?.organization?.name || '',
      organizationId: initialData?.organizationId || currentUser?.organizationId || null,
      trialOption: 'none',
    },
  });

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'USER',
      isActive: initialData?.isActive ?? true,
      phone: initialData?.phone || '',
      organizationName: initialData?.organization?.name || '',
      organizationId: initialData?.organizationId || null,
    },
  });

  const handleCreateSubmit = createForm.handleSubmit((data) => {
    let isTrial = false;
    let trialDays = 0;
    
    if (data.trialOption === '2') { isTrial = true; trialDays = 2; }
    else if (data.trialOption === '3') { isTrial = true; trialDays = 3; }
    else if (data.trialOption === '7') { isTrial = true; trialDays = 7; }

    const { trialOption, ...submitData } = data;
    onSubmitCreate?.({ ...submitData, isTrial, trialDays });
  });

  const handleUpdateSubmit = updateForm.handleSubmit((data) => {
    onSubmitUpdate?.(data);
  });

  return (
    <form onSubmit={isEdit ? handleUpdateSubmit : handleCreateSubmit} className="space-y-5">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Nama Lengkap <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Masukkan nama lengkap staf / ustadz..."
            {...(isEdit ? updateForm.register('name') : createForm.register('name'))}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
        </div>
        {((isEdit ? updateForm.formState.errors.name : createForm.formState.errors.name)) && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {(isEdit ? updateForm.formState.errors.name?.message : createForm.formState.errors.name?.message)}
          </p>
        )}
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Alamat Email <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="contoh: ustadz@hafalanku.com"
            {...(isEdit ? updateForm.register('email') : createForm.register('email'))}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
        </div>
        {((isEdit ? updateForm.formState.errors.email : createForm.formState.errors.email)) && (
          <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {(isEdit ? updateForm.formState.errors.email?.message : createForm.formState.errors.email?.message)}
          </p>
        )}
      </div>

      {/* Password Input (Only for Create Mode) */}
      {!isEdit && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Password Default <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Minimal 8 karakter..."
              {...createForm.register('password')}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>
          {createForm.formState.errors.password && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {createForm.formState.errors.password.message}
            </p>
          )}
        </div>
      )}

      {/* Role & Phone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Role Akses <span className="text-rose-500">*</span>
          </label>
          <select
            {...(isEdit ? updateForm.register('role') : createForm.register('role'))}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
          >
            <option value="USER">Pengajar / Ustadz (USER)</option>
            {currentUser?.role === 'SUPERADMIN' && (
              <option value="ADMIN">Admin Organisasi (ADMIN)</option>
            )}
            {currentUser?.role === 'SUPERADMIN' && isEdit && initialData?.role === 'SUPERADMIN' && (
              <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
            )}
          </select>
        </div>

        {/* Trial Account Dropdown (Only for Create Mode) */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Jenis Akun
            </label>
            <select
              {...createForm.register('trialOption')}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer font-medium"
            >
              <option value="none">Tidak (Akun Permanen)</option>
              <option value="2">Trial 2 Hari</option>
              <option value="3">Trial 3 Hari</option>
              <option value="7">Trial 7 Hari</option>
            </select>
          </div>
        )}

        {/* Phone Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Nomor WhatsApp / HP {(!isEdit) && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="text"
            placeholder="081234567890"
            {...(isEdit ? updateForm.register('phone') : createForm.register('phone'))}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
          {(!isEdit && createForm.formState.errors.phone) && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              {createForm.formState.errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Organization Field (Create & Edit Mode) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Nama Organisasi / Lembaga / TPQ
          </label>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
            Wajib/Diutamakan untuk Admin
          </span>
        </div>

        {currentUser?.role !== 'SUPERADMIN' ? (
          <div>
            <input
              type="text"
              value={currentUser?.organization?.name || 'Tidak ada Organisasi'}
              disabled
              className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-sm font-medium opacity-70 cursor-not-allowed"
            />
            {/* We must include the hidden inputs so that React Hook Form sends them when submitting */}
            <input type="hidden" {...(isEdit ? updateForm.register('organizationId') : createForm.register('organizationId'))} />
            <input type="hidden" {...(isEdit ? updateForm.register('organizationName') : createForm.register('organizationName'))} />
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              {...(isEdit ? updateForm.register('organizationId') : createForm.register('organizationId'))}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all cursor-pointer"
            >
              <option value="">Pilih dari daftar Organisasi...</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Atau tulis nama organisasi baru..."
              {...(isEdit ? updateForm.register('organizationName') : createForm.register('organizationName'))}
              className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Contoh: TPQ Al-Hidayah / Pondok Pesantren Tahfidh"
            {...(isEdit ? updateForm.register('organizationName') : createForm.register('organizationName'))}
            className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
          />
        )}
        <p className="text-[11px] text-muted-foreground">
          Masukkan nama TPQ, Pesantren, atau Lembaga untuk menghubungkan akun pengguna dan menghindari error status user admin.
        </p>
      </div>

      {/* Active Toggle (Only for Edit Mode) */}
      {isEdit && (
        <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-secondary/30">
          <div>
            <label className="text-xs font-semibold text-foreground block">Status Akun Pengguna</label>
            <p className="text-[11px] text-muted-foreground">Aktifkan untuk memberikan hak akses masuk sistem.</p>
          </div>
          <input
            type="checkbox"
            {...updateForm.register('isActive')}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-input text-xs font-medium hover:bg-secondary transition-all cursor-pointer"
          >
            Batal
          </button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
