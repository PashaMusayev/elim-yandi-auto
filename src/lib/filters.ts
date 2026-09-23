import type { Car, FuelType, GearboxType } from '@/types/car';

export type SortKey = 'yeni' | 'ucuz' | 'baha' | 'il-yeni' | 'il-kohne';

export interface Filters {
  minPrice?: number;
  maxPrice?: number;
  brands: string[];
  minYear?: number;
  maxYear?: number;
  fuels: FuelType[];
  gearboxes: GearboxType[];
  hideSold: boolean;
  q: string;
  sort: SortKey;
}

export const SORT_LABEL: Record<SortKey, string> = {
  yeni: 'Ən yeni gələnlər',
  ucuz: 'Ucuzdan bahaya',
  baha: 'Bahadan ucuza',
  'il-yeni': 'İl: yenidən köhnəyə',
  'il-kohne': 'İl: köhnədən yeniyə',
};

const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

export function filtersFromParams(p: URLSearchParams): Filters {
  const sort = p.get('sirala') as SortKey | null;
  return {
    minPrice: num(p.get('qmin')),
    maxPrice: num(p.get('qmax')),
    brands: list(p.get('marka')),
    minYear: num(p.get('ilmin')),
    maxYear: num(p.get('ilmax')),
    fuels: list(p.get('yanacaq')) as FuelType[],
    gearboxes: list(p.get('oturucu')) as GearboxType[],
    hideSold: p.get('satilan') === 'gizle',
    q: p.get('q') ?? '',
    sort: sort && sort in SORT_LABEL ? sort : 'yeni',
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: string, v: string | number | undefined) => v !== undefined && v !== '' && p.set(k, String(v));
  set('qmin', f.minPrice);
  set('qmax', f.maxPrice);
  if (f.brands.length) p.set('marka', f.brands.join(','));
  set('ilmin', f.minYear);
  set('ilmax', f.maxYear);
  if (f.fuels.length) p.set('yanacaq', f.fuels.join(','));
  if (f.gearboxes.length) p.set('oturucu', f.gearboxes.join(','));
  if (f.hideSold) p.set('satilan', 'gizle');
  set('q', f.q.trim());
  if (f.sort !== 'yeni') p.set('sirala', f.sort);
  return p;
}

export function activeFilterCount(f: Filters): number {
  return (
    Number(f.minPrice !== undefined || f.maxPrice !== undefined) +
    Number(f.minYear !== undefined || f.maxYear !== undefined) +
    f.brands.length +
    f.fuels.length +
    f.gearboxes.length +
    Number(f.hideSold)
  );
}

export function applyFilters(cars: Car[], f: Filters): Car[] {
  const q = f.q.trim().toLowerCase();
  const out = cars.filter(
    (c) =>
      (f.minPrice === undefined || c.price >= f.minPrice) &&
      (f.maxPrice === undefined || c.price <= f.maxPrice) &&
      (f.minYear === undefined || c.year >= f.minYear) &&
      (f.maxYear === undefined || c.year <= f.maxYear) &&
      (!f.brands.length || f.brands.includes(c.brand)) &&
      (!f.fuels.length || f.fuels.includes(c.fuel)) &&
      (!f.gearboxes.length || f.gearboxes.includes(c.gearbox)) &&
      (!f.hideSold || c.status !== 'satildi') &&
      (!q || `${c.brand} ${c.model} ${c.year}`.toLowerCase().includes(q)),
  );

  const rank = { satishda: 0, rezerv: 1, satildi: 2 } as const;
  const cmp: Record<SortKey, (a: Car, b: Car) => number> = {
    yeni: (a, b) => b.created_at.localeCompare(a.created_at),
    ucuz: (a, b) => a.price - b.price,
    baha: (a, b) => b.price - a.price,
    'il-yeni': (a, b) => b.year - a.year || a.price - b.price,
    'il-kohne': (a, b) => a.year - b.year || a.price - b.price,
  };
  // Satılanlar həmişə sonda — sosial sübut kimi görünür, amma satışdakıları ört-basdır etmir.
  return out.sort((a, b) => rank[a.status] - rank[b.status] || cmp[f.sort](a, b));
}
