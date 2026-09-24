import type { MouseEvent } from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { StatusStamp } from '@/components/ui/StatusBadge';
import { useCarModal } from '@/hooks/useCarModal';
import { favorites, useFavorites } from '@/lib/favorites';
import { carTitle, formatNumber, isNew } from '@/lib/format';
import { publicImageUrl } from '@/lib/supabase';
import type { Car } from '@/types/car';

/** "2008, 3.0 L, 265.000 km" — turbo.az üslubunda qısa xülasə. */
export function specLine(car: Pick<Car, 'year' | 'engine_l' | 'mileage_km'>): string {
  return [
    car.year,
    car.engine_l ? `${car.engine_l.toFixed(1)} L` : null,
    car.mileage_km != null ? `${formatNumber(car.mileage_km)} km` : null,
  ]
    .filter(Boolean)
    .join(', ');
}

export function FavoriteButton({ id, className = '' }: { id: string; className?: string }) {
  const { ids } = useFavorites();
  const active = ids.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favorites.toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? 'Seçilmişlərdən çıxar' : 'Seçilmişlərə əlavə et'}
      className={`grid size-8 place-items-center rounded-full backdrop-blur-md transition active:scale-90 ${
        active ? 'bg-flame text-white' : 'bg-black/45 text-white hover:bg-black/70'
      } ${className}`}
    >
      <Heart className={`size-4 ${active ? 'fill-current' : ''}`} />
    </button>
  );
}

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const { open } = useCarModal();
  const sold = car.status === 'satildi';

  // Adi klik → modal. Ctrl/⌘ klik və ya yeni tab → tam səhifə (/masin/...) açılır.
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    open(car.slug);
  };

  return (
    <Link
      to={`/masin/${car.slug}`}
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl bg-coal ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-ember/40"
    >
      <div className="relative">
        <LazyImage
          src={publicImageUrl(car.cover_thumb)}
          alt={`${carTitle(car)} ${car.year} — satılıq, Bakı`}
          priority={priority}
          className={`aspect-[4/3] [&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-105 ${sold ? 'grayscale-[.7]' : ''}`}
        />
        <FavoriteButton id={car.id} className="absolute top-1.5 right-1.5" />
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {car.status === 'satishda' && isNew(car.created_at) && (
            <span className="rounded bg-fire px-1.5 py-0.5 text-[10px] font-black uppercase">Yeni</span>
          )}
          {car.tiktok_url && <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold">▶ Video</span>}
        </div>
        <StatusStamp status={car.status} size="sm" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-2.5">
        <p className="flex items-center gap-1.5 text-[15px] font-black tabular-nums sm:text-base">
          <span aria-hidden="true" className="grid size-4 shrink-0 place-items-center rounded-full bg-ok text-[9px] text-white">
            ✓
          </span>
          <span className={sold ? 'text-white/50 line-through' : ''}>{formatNumber(car.price)}</span>
          <span className="text-xs font-bold text-white/70">AZN</span>
        </p>
        <h3 className="truncate text-[13px] leading-tight text-white/90 group-hover:text-ember sm:text-sm">{carTitle(car)}</h3>
        <p className="truncate text-[12px] leading-tight text-white/60">{specLine(car)}</p>
        <p className="mt-auto pt-1 text-[11px] text-white/35">Bakı · Babək</p>
      </div>
    </Link>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-coal ring-1 ring-white/5">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-1.5 p-2.5">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function CarGrid({ cars, loading, skeletons = 8 }: { cars?: Car[]; loading?: boolean; skeletons?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
      {loading
        ? Array.from({ length: skeletons }, (_, i) => <CarCardSkeleton key={i} />)
        : cars?.map((c, i) => <CarCard key={c.id} car={c} priority={i < 4} />)}
    </div>
  );
}
