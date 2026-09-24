import type { Car, FuelType, GearboxType } from '@/types/car';

export type SortKey = 'yeni' | 'ucuz' | 'baha' | 'il-yeni' | 'yurus-az';

export interface Filters {
  minPrice?: number;
  maxPrice?: number;
  brands: string[];
  bodyTypes: string[];
  minYear?: number;
  maxYear?: number;
  minKm?: number;
  maxKm?: number;
  fuels: FuelType[];
  gearboxes: GearboxType[];
  hideSold: boolean;
  q: string;
  sort: SortKey;
}

export const SORT_LABEL: Record<SortKey, string> = {
  yeni: 'Ən yeni gələnlər',
  ucuz: 'Qiymət: ucuzdan bahaya',
  baha: 'Qiymət: bahadan ucuza',
  'il-yeni': 'Buraxılış ili: ən yeni',
  'yurus-az': 'Yürüş: ən az',
};

export const EMPTY_FILTERS: Filters = {
  brands: [],
  bodyTypes: [],
  fuels: [],
  gearboxes: [],
  hideSold: false,
  q: '',
  sort: 'yeni',
};

const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : []);

export function filtersFromParams(p: URLSearchParams): Filters {
  const sort = p.get('sirala') as SortKey | null;
  return {
    minPrice: num(p.get('qmin')),
    maxPrice: num(p.get('qmax')),
    brands: list(p.get('marka')),
    bodyTypes: list(p.get('ban')),
    minYear: num(p.get('ilmin')),
    maxYear: num(p.get('ilmax')),
    minKm: num(p.get('kmmin')),
    maxKm: num(p.get('kmmax')),
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
  const setList = (k: string, v: string[]) => v.length && p.set(k, v.join(','));
  set('qmin', f.minPrice);
  set('qmax', f.maxPrice);
  setList('marka', f.brands);
  setList('ban', f.bodyTypes);
  set('ilmin', f.minYear);
  set('ilmax', f.maxYear);
  set('kmmin', f.minKm);
  set('kmmax', f.maxKm);
  setList('yanacaq', f.fuels);
  setList('oturucu', f.gearboxes);
  if (f.hideSold) p.set('satilan', 'gizle');
  set('q', f.q.trim());
  if (f.sort !== 'yeni') p.set('sirala', f.sort);
  return p;
}

/** Aktiv filtr qruplarının sayı ("Filtrlər (3)" düyməsi üçün). Axtarış və sıralama sayılmır. */
export function activeFilterCount(f: Filters): number {
  return [
    f.minPrice !== undefined || f.maxPrice !== undefined,
    f.minYear !== undefined || f.maxYear !== undefined,
    f.minKm !== undefined || f.maxKm !== undefined,
    f.brands.length > 0,
    f.bodyTypes.length > 0,
    f.fuels.length > 0,
    f.gearboxes.length > 0,
    f.hideSold,
  ].filter(Boolean).length;
}

export function applyFilters(cars: Car[], f: Filters): Car[] {
  const q = f.q.trim().toLowerCase();
  const inRange = (v: number | null, min?: number, max?: number) =>
    (min === undefined || (v ?? 0) >= min) && (max === undefined || (v ?? 0) <= max);

  const out = cars.filter(
    (c) =>
      inRange(c.price, f.minPrice, f.maxPrice) &&
      inRange(c.year, f.minYear, f.maxYear) &&
      inRange(c.mileage_km, f.minKm, f.maxKm) &&
      (!f.brands.length || f.brands.includes(c.brand)) &&
      (!f.bodyTypes.length || (c.body_type !== null && f.bodyTypes.includes(c.body_type))) &&
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
    'yurus-az': (a, b) => (a.mileage_km ?? Infinity) - (b.mileage_km ?? Infinity),
  };
  // Satılanlar həmişə sonda — sosial sübut kimi görünür, amma satışdakıları ört-basdır etmir.
  return out.sort((a, b) => rank[a.status] - rank[b.status] || cmp[f.sort](a, b));
}
