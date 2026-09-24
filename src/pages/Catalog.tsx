import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { CarGrid } from '@/components/car/CarCard';
import { FilterBar } from '@/components/catalog/FilterBar';
import { Pagination } from '@/components/catalog/Pagination';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { MODAL_PARAM } from '@/hooks/useCarModal';
import { useSeo } from '@/hooks/useSeo';
import { fetchCars } from '@/lib/cars';
import { applyFilters, EMPTY_FILTERS, filtersFromParams, filtersToParams, type Filters } from '@/lib/filters';

const PER_PAGE = 12;
const PAGE_PARAM = 'sehife';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const page = Math.max(1, Number(params.get(PAGE_PARAM)) || 1);
  const topRef = useRef<HTMLDivElement>(null);

  /** Filtr dəyişəndə 1-ci səhifəyə qayıt; açıq elan modalı (?elan=) toxunulmaz qalsın. */
  const setFilters = (f: Filters) => {
    const next = filtersToParams(f);
    const modal = params.get(MODAL_PARAM);
    if (modal) next.set(MODAL_PARAM, modal);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const setPage = (p: number) => {
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (p <= 1) n.delete(PAGE_PARAM);
        else n.set(PAGE_PARAM, String(p));
        return n;
      },
      { preventScrollReset: true },
    );
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const brandTitle = filters.brands.length === 1 ? filters.brands[0] : null;
  useSeo({
    title: brandTitle ? `Bakıda satılıq ${brandTitle} — kataloq` : 'Kataloq — Bakıda satılıq işlənmiş maşınlar',
    description: `${brandTitle ?? 'Mercedes, BMW, Toyota və digər'} işlənmiş avtomobillər Bakıda, Babəkdə. Qiymət, il, yanacaq və sürətlər qutusuna görə filtrlə. Elim Yandı Auto.`,
  });

  const { data: cars, loading, error, reload } = useAsync(() => fetchCars(), []);
  const result = useMemo(() => (cars ? applyFilters(cars, filters) : undefined), [cars, filters]);
  const totalPages = result ? Math.max(1, Math.ceil(result.length / PER_PAGE)) : 1;
  const current = Math.min(page, totalPages);
  const pageCars = result?.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const onSale = result?.filter((c) => c.status !== 'satildi').length ?? 0;

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
      </header>

      <div ref={topRef} className="scroll-mt-20 space-y-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Marka, model axtar…"
            aria-label="Axtarış"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="w-full rounded-xl bg-white/5 py-3 pr-3 pl-9 text-base ring-1 ring-white/10 outline-none focus:ring-ember"
          />
        </label>
        <FilterBar cars={cars ?? []} filters={filters} onChange={setFilters} />
      </div>

      <p className="mt-4 mb-3 text-sm text-white/60" aria-live="polite">
        {result ? (
          <>
            <b className="text-white">{result.length}</b> elan tapıldı · {onSale} satışda
            {totalPages > 1 && ` · səhifə ${current}/${totalPages}`}
          </>
        ) : (
          'Yüklənir…'
        )}
      </p>

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
          <Button variant="ghost" onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })} className="mt-5">
            Filtrləri sıfırla
          </Button>
        </div>
      ) : (
        <>
          <CarGrid cars={pageCars} loading={loading} skeletons={PER_PAGE} />
          <Pagination page={current} total={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
