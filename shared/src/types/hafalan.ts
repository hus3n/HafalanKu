export type Predikat = 'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'MAQBUL' | 'ULANG';

export interface Hafalan {
  id: string;
  santriId: string;
  surahNumber: number;
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
  predikat: Predikat;
  date: Date;
  notes?: string | null;
  userId: string;
  createdAt: Date;
}
