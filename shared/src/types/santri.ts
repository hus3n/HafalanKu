export interface Santri {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string; // Decrypted on delivery, encrypted in DB
  kelasId?: string | null;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Kelas {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt: Date;
}
