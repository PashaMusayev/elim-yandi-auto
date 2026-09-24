import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Kosalar/turbo.az üslubu: 1 … 4 5 6 … 12 */
export function pageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const box = 'grid h-10 min-w-10 place-items-center rounded-xl px-2 text-sm font-bold transition sm:h-11 sm:min-w-11';
  const idle = 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10 active:scale-95';
  const disabled = 'bg-white/[.02] text-white/20 ring-1 ring-white/5 cursor-not-allowed';

  return (
    <nav aria-label="Kataloq səhifələri" className="mt-8 flex items-center justify-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Əvvəlki səhifə"
        className={`${box} ${page <= 1 ? disabled : idle}`}
      >
        <ChevronLeft className="size-4" />
      </button>
      {pageItems(page, total).map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="grid h-10 w-7 place-items-center font-bold text-white/40">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onChange(it)}
            aria-current={it === page ? 'page' : undefined}
            aria-label={`Səhifə ${it}`}
            className={`${box} ${it === page ? 'cursor-default bg-fire font-black text-white' : idle}`}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= total}
        aria-label="Növbəti səhifə"
        className={`${box} ${page >= total ? disabled : idle}`}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
