import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { CarGrid } from '@/components/car/CarCard';
import { FilterPanel } from '@/components/catalog/FilterPanel';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useSeo } from '@/hooks/useSeo';
import { fetchCars } from '@/lib/cars';
import {
  activeFilterCount,
  applyFilters,
  filtersFromParams,
  filtersToParams,
  SORT_LABEL,
  type Filters,
  type SortKey,
} from '@/lib/filters';
import { lockScroll } from '@/lib/scrollLock';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const setFilters = (f: Filters) => setParams(filtersToParams(f), { replace: true });
  const [sheet, setSheet] = useState(false);

  useEffect(() => (sheet ? lockScroll() : undefined), [sheet]);

  const brandTitle = filters.brands.length === 1 ? filters.brands[0] : null;
  useSeo({
    title: brandTitle ? `Bakıda satılıq ${brandTitle} — kataloq` : 'Kataloq — Bakıda satılıq işlənmiş maşınlar',
    description: `${brandTitle ?? 'Mercedes, BMW, Toyota və digər'} işlənmiş avtomobillər Bakıda, Babəkdə. Qiymət, il, yanacaq və sürətlər qutusuna görə filtrlə. Elim Yandı Auto.`,
  });

  const { data: cars, loading, error, reload } = useAsync(() => fetchCars(), []);
  const brands = useMemo(() => [...new Set(cars?.map((c) => c.brand))].sort(), [cars]);
  const years = useMemo(() => {
    const ys = cars?.map((c) => c.year) ?? [];
    if (!ys.length) return [];
    const [lo, hi] = [Math.min(...ys), Math.max(...ys)];
    return Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
  }, [cars]);
  const result = useMemo(() => (cars ? applyFilters(cars, filters) : undefined), [cars, filters]);
  const count = activeFilterCount(filters);
  const reset = () => setFilters({ ...filtersFromParams(new URLSearchParams()), sort: filters.sort, q: filters.q });

  return (
    <div className="container-x py-6 sm:py-10">
      <header className="mb-5">
        <h1 className="font-display text-3xl font-black uppercase sm:text-5xl">
          {brandTitle ? (
            <>
              Satılıq <span className="text-fire">{brandTitle}</span>
            </>
          ) : (
            <>
              Kataloq <span className="text-fire">🔥</span>
            </>
          )}
        </h1>
        <p className="mt-1 text-white/60">
          {result ? `${result.filter((c) => c.status !== 'satildi').length} maşın satışda` : 'Yüklənir…'}
        </p>
      </header>

      {/* Axtarış + sıralama + mobil filtr düyməsi */}
      <div className="sticky top-16 z-30 -mx-4 mb-5 flex gap-2 bg-ink/90 px-4 py-2 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Marka, model…"
            aria-label="Axtarış"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="w-full rounded-xl bg-white/5 py-3 pr-3 pl-9 text-base ring-1 ring-white/10 outline-none focus:ring-ember"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Sırala</span>
          <ArrowDownUp className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ember" />
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
            className="h-full w-12 appearance-none rounded-xl bg-white/5 pl-9 text-transparent ring-1 ring-white/10 outline-none focus:ring-ember sm:w-auto sm:pr-4 sm:text-sm sm:font-semibold sm:text-white"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k} className="text-black">
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="relative flex items-center gap-2 rounded-xl bg-fire px-4 font-bold md:hidden"
        >
          <SlidersHorizontal className="size-4" />
          <span className="sr-only sm:not-sr-only">Filtr</span>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-white text-[11px] font-black text-black">
              {count}
            </span>
          )}
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <FilterPanel value={filters} onChange={setFilters} brands={brands} years={years} />
            {count > 0 && (
              <button type="button" onClick={reset} className="text-sm font-bold text-ember">
                Filtrləri sıfırla
              </button>
            )}
          </div>
        </aside>

        <section aria-live="polite">
          {error ? (
            <div className="rounded-2xl bg-coal p-8 text-center">
              <p className="mb-4">Maşınları yükləmək olmadı. İnterneti yoxla 🙏</p>
              <Button onClick={reload}>Yenidən cəhd et</Button>
            </div>
          ) : result && result.length === 0 ? (
            <div className="rounded-2xl bg-coal p-10 text-center">
              <p className="text-4xl">🤷‍♂️</p>
              <p className="mt-3 text-lg font-bold">Bu filtrə uyğun maşın yoxdur… hələlik!</p>
              <p className="mt-1 text-white/60">Nihada yaz — bəlkə sabah gəlir.</p>
              <Button variant="ghost" onClick={reset} className="mt-5">
                Filtrləri sıfırla
              </Button>
            </div>
          ) : (
            <CarGrid cars={result} loading={loading} />
          )}
        </section>
      </div>

      {/* Mobil filtr paneli (bottom sheet) */}
      {sheet && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filtrlər">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSheet(false)} />
          <div className="pb-safe absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-coal">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h2 className="text-lg font-black">Filtrlər</h2>
              <button type="button" onClick={() => setSheet(false)} aria-label="Bağla" className="grid size-10 place-items-center">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-5">
              <FilterPanel value={filters} onChange={setFilters} brands={brands} years={years} />
            </div>
            <div className="flex gap-2 border-t border-white/5 p-3">
              <Button variant="ghost" onClick={reset} className="flex-1">
                Sıfırla
              </Button>
              <Button onClick={() => setSheet(false)} className="flex-[2]">
                {result?.length ?? 0} maşını göstər
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
