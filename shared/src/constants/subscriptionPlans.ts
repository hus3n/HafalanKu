export type SubscriptionPlanId = 
  | 'TRIAL_30_DAYS'
  | 'TRIAL_14_DAYS'
  | '1_MONTH'
  | '6_MONTHS'
  | '12_MONTHS'
  | 'ENTERPRISE'
  | 'LIFETIME';

export interface PlanPricingDetail {
  priceText: string;
  priceMonthlyEquivalent?: string;
  billingText: string;
  nominalRp: number;
}

export const SUBSCRIPTION_PRICING = {
  personal: {
    TRIAL_30_DAYS: {
      priceText: 'Gratis',
      billingText: '30 Hari Uji Coba',
      nominalRp: 0,
    },
    TRIAL_14_DAYS: {
      priceText: 'Gratis',
      billingText: '30 Hari Uji Coba',
      nominalRp: 0,
    },
    '1_MONTH': {
      priceText: 'Rp 15.000',
      billingText: 'per bulan',
      nominalRp: 15000,
    },
    '6_MONTHS': {
      priceText: 'Rp 85.000',
      priceMonthlyEquivalent: '~Rp 14.100/bln',
      billingText: 'per 6 bulan (Hemat)',
      nominalRp: 85000,
    },
    '12_MONTHS': {
      priceText: 'Rp 165.000',
      priceMonthlyEquivalent: '~Rp 13.750/bln',
      billingText: 'per tahun (Paling Hemat)',
      nominalRp: 165000,
    },
    LIFETIME: {
      priceText: 'Kontak Admin',
      billingText: 'Akses Selamanya',
      nominalRp: 0,
    },
  },
  organization: {
    TRIAL_30_DAYS: {
      priceText: 'Gratis',
      billingText: '30 Hari Uji Coba',
      nominalRp: 0,
    },
    TRIAL_14_DAYS: {
      priceText: 'Gratis',
      billingText: '30 Hari Uji Coba',
      nominalRp: 0,
    },
    '1_MONTH': {
      priceText: 'Rp 55.000',
      billingText: 'per bulan',
      nominalRp: 55000,
    },
    '6_MONTHS': {
      priceText: 'Rp 300.000',
      priceMonthlyEquivalent: 'Rp 50.000/bln',
      billingText: 'per 6 bulan (Hemat)',
      nominalRp: 300000,
    },
    '12_MONTHS': {
      priceText: 'Rp 550.000',
      priceMonthlyEquivalent: '~Rp 45.800/bln',
      billingText: 'per tahun (Paling Hemat)',
      nominalRp: 550000,
    },
    ENTERPRISE: {
      priceText: 'Rp 500.000',
      billingText: 'per bulan (Multi-Cabang Dedicated)',
      nominalRp: 500000,
    },
    LIFETIME: {
      priceText: 'Kontak Admin',
      billingText: 'Akses Selamanya',
      nominalRp: 0,
    },
  },
} as const;

export function formatSubscriptionPlanText(plan?: string | null, isOrg = false): string {
  if (!plan || plan === 'TRIAL_30_DAYS' || plan === 'TRIAL_14_DAYS' || plan === 'TRIAL' || plan === '30_DAYS' || plan === '14_DAYS') {
    return '🎁 Trial Gratis (30 Hari Percobaan Bebas Fitur)';
  }
  if (plan === '1_MONTH') {
    return isOrg
      ? '💎 Langganan Berbayar: Paket Organisasi 1 Bulan (Rp 55.000)'
      : '💎 Langganan Berbayar: Paket Pribadi 1 Bulan (Rp 15.000)';
  }
  if (plan === '6_MONTHS') {
    return isOrg
      ? '💎 Langganan Berbayar: Paket Organisasi 6 Bulan (Rp 300.000 - Hemat)'
      : '💎 Langganan Berbayar: Paket Pribadi 6 Bulan (Rp 85.000 - Hemat)';
  }
  if (plan === '12_MONTHS' || plan === '1_YEAR') {
    return isOrg
      ? '💎 Langganan Berbayar: Paket Organisasi 1 Tahun (Rp 550.000 - Paling Hemat)'
      : '💎 Langganan Berbayar: Paket Pribadi 1 Tahun (Rp 165.000 - Paling Hemat)';
  }
  if (plan === 'ENTERPRISE' || plan === 'ENTERPRISE_1_MONTH') {
    return '🏢 Langganan Berbayar: Paket Enterprise (Rp 500.000 / bulan)';
  }
  if (plan === 'LIFETIME') {
    return '👑 Langganan Berbayar: Paket Lifetime / Permanen';
  }
  return plan;
}
