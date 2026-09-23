import type { Car } from '@/types/car';

const nf = new Intl.NumberFormat('az-AZ');

/** 18500 → "18.500" (Azərbaycanda nöqtə ilə ayrılır). */
export function formatNumber(n: number): string {
  return nf.format(n).replace(/[\s  ,]/g, '.');
}

export const formatPrice = (n: number) => `${formatNumber(n)} AZN`;
export const formatKm = (n: number) => `${formatNumber(n)} km`;

export const carTitle = (c: Pick<Car, 'brand' | 'model'>) => `${c.brand} ${c.model}`;

export function engineLabel(c: Pick<Car, 'engine_l' | 'engine_hp'>): string | null {
  const parts = [c.engine_l ? `${c.engine_l.toFixed(1)} L` : null, c.engine_hp ? `${c.engine_hp} a.g.` : null];
  const s = parts.filter(Boolean).join(' · ');
  return s || null;
}

export function isNew(createdAt: string, days = 7): boolean {
  return Date.now() - new Date(createdAt).getTime() < days * 864e5;
}
