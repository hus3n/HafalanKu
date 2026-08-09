export const PREDIKAT = {
  MUMTAZ: 'MUMTAZ',
  JAYYID_JIDDAN: 'JAYYID_JIDDAN',
  JAYYID: 'JAYYID',
  MAQBUL: 'MAQBUL',
  ULANG: 'ULANG'
} as const;

export const PREDIKAT_LABELS: Record<keyof typeof PREDIKAT, string> = {
  MUMTAZ: 'Mumtaz (Istimewa)',
  JAYYID_JIDDAN: 'Jayyid Jiddan (Sangat Baik)',
  JAYYID: 'Jayyid (Baik)',
  MAQBUL: 'Maqbul (Cukup)',
  ULANG: 'Ulang (Perlu Ulang)'
};

export const PREDIKAT_WEIGHTS: Record<keyof typeof PREDIKAT, number> = {
  MUMTAZ: 0.2,
  JAYYID_JIDDAN: 0.4,
  JAYYID: 0.6,
  MAQBUL: 0.8,
  ULANG: 1.0
};
