import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clock, MapPin, Share2, X } from 'lucide-react';
import { CarCard, FavoriteButton } from '@/components/car/CarCard';
import { CallButton, WhatsAppButton } from '@/components/car/ContactButtons';
import { Gallery } from '@/components/car/Gallery';
import { SpecTable } from '@/components/car/SpecTable';
import { TikTokEmbed } from '@/components/car/TikTokEmbed';
import { PriceTag } from '@/components/ui/PriceTag';
import { StatusPill, StatusStamp } from '@/components/ui/StatusBadge';
import { PRIMARY_PHONE, SITE } from '@/config/site';
import { carTitle, formatKm } from '@/lib/format';
import { publicImageUrl } from '@/lib/supabase';
import { track } from '@/lib/track';
import type { Car, CarWithImages } from '@/types/car';

/** "BMW X5, 3.0 L, 2019 il" */
function mainTitle(car: Car): string {
  return [carTitle(car), car.engine_l ? `${car.engine_l.toFixed(1)} L` : null, `${car.year} il`].filter(Boolean).join(', ');
}

/** Kosalar-dakı kimi ballarla oxşar elanlar: marka, model, ban, yanacaq, qiymət yaxınlığı. */
function similarCars(car: Car, all: Car[]): Car[] {
  const lc = (s: string | null) => (s ?? '').toLowerCase();
  return all
    .filter((c) => c.id !== car.id && c.status !== 'satildi')
    .map((c) => {
      let score = 0;
      if (lc(c.brand) === lc(car.brand)) score += 50;
      if (lc(c.model) === lc(car.model)) score += 40;
      if (c.body_type && lc(c.body_type) === lc(car.body_type)) score += 25;
      if (c.fuel === car.fuel) score += 15;
      const diff = Math.abs(c.price - car.price) / car.price;
      if (diff <= 0.2) score += 20;
      else if (diff <= 0.4) score += 10;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.c);
}

function ShowroomInfo() {
  return (
    <div className="space-y-2 text-sm">
      <p className="font-bold">{SITE.name}</p>
      <a href={SITE.mapsLink} target="_blank" rel="noopener" className="flex items-start gap-2 text-white/70 hover:text-ember">
        <MapPin className="mt-0.5 size-4 shrink-0 text-ember" />
        <span>
          {SITE.address}
          <span className="block text-xs text-white/45">{SITE.addressNote}</span>
        </span>
      </a>
      <p className="flex items-start gap-2 text-white/70">
        <Clock className="mt-0.5 size-4 shrink-0 text-ember" />
        <span>{SITE.hours.map((h) => `${h.days}: ${h.time}`).join(' · ')}</span>
      </p>
    </div>
  );
}

interface Props {
  car: CarWithImages;
  allCars?: Car[];
  /** 'modal' — öz başlığı və alt paneli olan tam ekran pəncərə; 'page' — /masin/:slug səhifəsi. */
  variant: 'modal' | 'page';
  onBack?: () => void;
  onClose?: () => void;
}

export function CarDetailView({ car, allCars = [], variant, onBack, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const sold = car.status === 'satildi';
  const title = mainTitle(car);
  const images = car.car_images.map((i) => ({ full: publicImageUrl(i.path), thumb: publicImageUrl(i.thumb) }));
  const similar = useMemo(() => similarCars(car, allCars), [car, allCars]);

  useEffect(() => {
    track(car.id, 'view');
  }, [car.id]);

  const share = async () => {
    const url = `${SITE.url}/masin/${car.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${carTitle(car)} — ${SITE.name}`, text: `${title} — ${car.price} AZN`, url });
        return;
      }
    } catch {
      /* ləğv edildi — kopyalamağa keç */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* boş */
    }
  };

  const iconBtn = 'grid size-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 active:scale-95';

  return (
    <div className={variant === 'modal' ? 'flex h-full flex-col' : ''}>
      {/* Başlıq: geri · Elim Yandı Auto · paylaş/❤️ */}
      <div className="relative z-30 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-ink/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <button type="button" onClick={onBack} className={iconBtn} aria-label="Geri">
          <ArrowLeft className="size-5" />
        </button>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-display text-sm font-black tracking-wide uppercase sm:text-base">
          Elim <span className="text-fire">Yandı</span> Auto
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-white/5 px-3 text-sm font-bold ring-1 ring-white/10 transition hover:bg-white/10 active:scale-95"
            aria-label="Paylaş"
          >
            {copied ? <Check className="size-4 text-green-400" /> : <Share2 className="size-4" />}
            <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Paylaş'}</span>
          </button>
          <FavoriteButton id={car.id} className="!size-10 !rounded-xl" />
          {onClose && (
            <button type="button" onClick={onClose} className={`${iconBtn} hidden md:grid`} aria-label="Bağla">
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>

      <div className={variant === 'modal' ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain' : ''}>
        {/* Üst hissə: solda şəkil + cədvəl, sağda sabit qiymət kartı */}
        <div className="border-b border-white/10 md:flex md:items-start">
          <div className="md:w-[58%] lg:w-[60%]">
            <Gallery images={images} alt={`${carTitle(car)} ${car.year}`} overlay={<StatusStamp status={car.status} />} />
            <div className="hidden border-t border-white/10 p-6 md:block">
              <SpecTable car={car} />
            </div>
          </div>

          <aside className="hidden p-4 md:sticky md:top-0 md:block md:w-[42%] lg:w-[40%] lg:p-5">
            <div className="space-y-4 rounded-2xl bg-coal p-5 ring-1 ring-white/10">
              <PriceTag price={car.price} size="lg" struck={sold} />
              <div>
                <h1 className="text-lg leading-snug font-bold">{title}</h1>
                {car.mileage_km != null && <p className="mt-1 text-sm text-white/60">{formatKm(car.mileage_km)}</p>}
                <div className="mt-2">
                  <StatusPill status={car.status} />
                </div>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4">
                {!sold && <CallButton car={car} className="w-full !py-3 !text-base" phone={PRIMARY_PHONE} label={`Zəng et: ${PRIMARY_PHONE.display}`} />}
                <WhatsAppButton car={car} className="w-full !py-3 !text-base" />
              </div>
              <div className="border-t border-white/10 pt-4">
                <ShowroomInfo />
              </div>
            </div>
          </aside>
        </div>

        <div className={`mx-auto max-w-5xl space-y-6 p-4 sm:p-5 md:p-6 ${variant === 'modal' ? 'pb-28 md:pb-8' : ''}`}>
          {/* Mobil: başlıq və qiymət */}
          <div className="space-y-2 border-b border-white/10 pb-4 md:hidden">
            <PriceTag price={car.price} size="lg" struck={sold} />
            <h1 className="text-lg leading-snug font-bold">{title}</h1>
            <div className="flex items-center gap-2 text-sm text-white/60">
              {car.mileage_km != null && <span>{formatKm(car.mileage_km)}</span>}
              <StatusPill status={car.status} />
            </div>
          </div>

          {/* Mobil: xüsusiyyətlər */}
          <div className="border-b border-white/10 pb-5 md:hidden">
            <SpecTable car={car} />
          </div>

          {sold && (
            <p className="rounded-xl bg-flame/10 p-3 text-sm text-white/80">
              Bu maşın artıq yeni sahibinə çatıb 🎉 Oxşarını axtarırsan — yaz, tapaq!
            </p>
          )}

          {car.description && (
            <section>
              <h2 className="mb-2 text-lg font-black">{SITE.owner} nə deyir? 🗣️</h2>
              <p className="leading-relaxed whitespace-pre-line text-white/85">{car.description}</p>
            </section>
          )}

          {car.tiktok_url && (
            <section>
              <h2 className="mb-3 text-lg font-black">TikTok videosu</h2>
              <TikTokEmbed url={car.tiktok_url} />
            </section>
          )}

          <section className="rounded-2xl bg-coal p-4 ring-1 ring-white/10 md:hidden">
            <ShowroomInfo />
          </section>

          {similar.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
                Bənzər elanlar
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold">{similar.length}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {similar.map((c) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Mobil alt panel: Zəng et | WhatsApp — maşının adı və qiyməti mesaja avtomatik yazılır */}
      <div
        className={`pb-safe inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden ${
          variant === 'modal' ? 'absolute' : 'fixed'
        }`}
      >
        <div className="flex gap-2 p-2.5">
          {!sold && <CallButton car={car} className="flex-1 !px-3" />}
          <WhatsAppButton car={car} compact className="flex-[1.4] !px-3" />
        </div>
      </div>
    </div>
  );
}
