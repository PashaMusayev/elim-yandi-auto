import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { lockScroll } from '@/lib/scrollLock';

export interface GalleryImage {
  full: string;
  thumb: string;
}

/** Mobil: barmaqla sürüşdürmə (scroll-snap). Toxunanda tam ekran. */
export function Gallery({ images, alt, overlay }: { images: GalleryImage[]; alt: string; overlay?: React.ReactNode }) {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [{ full: '/placeholder-car.svg', thumb: '/placeholder-car.svg' }];

  const go = (i: number) => {
    const n = (i + list.length) % list.length;
    setIdx(n);
    const el = track.current;
    if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = track.current;
    if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    if (!zoom) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % list.length);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom, list.length]);

  return (
    <div>
      <div className="relative overflow-hidden bg-coal md:rounded-2xl">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="karusel"
        >
          {list.map((im, i) => (
            <button
              key={im.full + i}
              type="button"
              onClick={() => setZoom(true)}
              className="w-full shrink-0 snap-center"
              aria-label={`Şəkil ${i + 1}, böyüt`}
            >
              <LazyImage src={im.full} alt={`${alt} — şəkil ${i + 1}`} priority={i === 0} className="aspect-[4/3]" />
            </button>
          ))}
        </div>
        {overlay}
        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Əvvəlki şəkil"
              className="absolute top-1/2 left-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 md:grid"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Növbəti şəkil"
              className="absolute top-1/2 right-2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 md:grid"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold tabular-nums">
              {idx + 1} / {list.length}
            </span>
          </>
        )}
        <Expand className="pointer-events-none absolute top-3 right-3 size-5 text-white/70" />
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4 md:px-0">
          {list.map((im, i) => (
            <button
              key={im.thumb + i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Şəkil ${i + 1}`}
              aria-current={i === idx}
              className={`w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === idx ? 'ring-ember' : 'opacity-60 ring-transparent'}`}
            >
              <LazyImage src={im.thumb} alt="" className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label="Şəkillər">
          <div className="flex items-center justify-between p-3">
            <span className="text-sm font-bold tabular-nums">
              {idx + 1} / {list.length}
            </span>
            <button type="button" onClick={() => setZoom(false)} aria-label="Bağla" className="grid size-11 place-items-center rounded-full bg-white/10">
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <img src={list[idx].full} alt={`${alt} — şəkil ${idx + 1}`} className="max-h-full max-w-full object-contain" />
            {list.length > 1 && (
              <>
                <button type="button" onClick={() => setIdx((idx - 1 + list.length) % list.length)} aria-label="Əvvəlki" className="absolute inset-y-0 left-0 w-1/3" />
                <button type="button" onClick={() => setIdx((idx + 1) % list.length)} aria-label="Növbəti" className="absolute inset-y-0 right-0 w-1/3" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
