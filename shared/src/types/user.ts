export type Role = 'SUPERADMIN' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Organization {
  id: string;
  name: string;
  adminId: string;
  createdAt: Date;
}
