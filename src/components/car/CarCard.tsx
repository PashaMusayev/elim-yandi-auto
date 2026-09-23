import { Link } from 'react-router';
import { Calendar, Fuel, Gauge, Settings2 } from 'lucide-react';
import { LazyImage } from '@/components/ui/LazyImage';
import { PriceTag } from '@/components/ui/PriceTag';
import { StatusStamp } from '@/components/ui/StatusBadge';
import { carTitle, engineLabel, formatKm, isNew } from '@/lib/format';
import { publicImageUrl } from '@/lib/supabase';
import { FUEL_LABEL, GEARBOX_LABEL, type Car } from '@/types/car';

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const sold = car.status === 'satildi';
  const engine = engineLabel(car);
  return (
    <Link
      to={`/masin/${car.slug}`}
      className="group block overflow-hidden rounded-2xl bg-coal ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-ember/40"
    >
      <div className="relative">
        <LazyImage
          src={publicImageUrl(car.cover_thumb)}
          alt={`${carTitle(car)} ${car.year} — satılıq, Bakı`}
          priority={priority}
          className={`aspect-[4/3] ${sold ? 'grayscale-[.7]' : ''}`}
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          {car.status === 'satishda' && isNew(car.created_at) && (
            <span className="rounded-md bg-fire px-2 py-0.5 text-[11px] font-black uppercase">Yeni gəldi</span>
          )}
          {car.tiktok_url && (
            <span className="rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-bold">▶ Video</span>
          )}
        </div>
        <StatusStamp status={car.status} />
        <div className="absolute bottom-2 left-2">
          <PriceTag price={car.price} size="sm" struck={sold} />
        </div>
      </div>
      <div className="space-y-2 p-3.5">
        <h3 className="truncate text-lg leading-tight font-extrabold group-hover:text-ember">
          {carTitle(car)}
        </h3>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px] text-white/70">
          <li className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-ember" /> {car.year}
          </li>
          <li className="flex items-center gap-1.5">
            <Fuel className="size-3.5 text-ember" /> {FUEL_LABEL[car.fuel]}
          </li>
          {engine && (
            <li className="flex items-center gap-1.5">
              <Settings2 className="size-3.5 text-ember" /> {engine}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-ember" />{' '}
            {car.mileage_km != null ? formatKm(car.mileage_km) : GEARBOX_LABEL[car.gearbox]}
          </li>
        </ul>
      </div>
    </Link>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-coal ring-1 ring-white/5">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}

export function CarGrid({ cars, loading, skeletons = 6 }: { cars?: Car[]; loading?: boolean; skeletons?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {loading
        ? Array.from({ length: skeletons }, (_, i) => <CarCardSkeleton key={i} />)
        : cars?.map((c, i) => <CarCard key={c.id} car={c} priority={i < 2} />)}
    </div>
  );
}
