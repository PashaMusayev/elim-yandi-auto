import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronLeft, MapPin } from 'lucide-react';
import { CarGrid } from '@/components/car/CarCard';
import { CallButton, WhatsAppButton } from '@/components/car/ContactButtons';
import { Gallery } from '@/components/car/Gallery';
import { SpecTable } from '@/components/car/SpecTable';
import { TikTokEmbed } from '@/components/car/TikTokEmbed';
import { ButtonLink } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { PriceTag } from '@/components/ui/PriceTag';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { StatusPill, StatusStamp } from '@/components/ui/StatusBadge';
import { SITE } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { useSeo } from '@/hooks/useSeo';
import { fetchCarBySlug, fetchCars } from '@/lib/cars';
import { carSeo } from '@/lib/seo';
import { carTitle } from '@/lib/format';
import { publicImageUrl } from '@/lib/supabase';
import { track } from '@/lib/track';
import NotFound from './NotFound';

export default function CarDetail() {
  const { slug = '' } = useParams();
  const { data: car, loading, error } = useAsync(() => fetchCarBySlug(slug), [slug]);
  const { data: all } = useAsync(() => fetchCars(), []);

  useEffect(() => {
    if (car) track(car.id, 'view');
  }, [car]);

  const seo = useMemo(() => (car ? carSeo(car, SITE.url) : null), [car]);
  useSeo(
    seo ?? { title: 'Maşın', description: 'Elim Yandı Auto — Bakıda satılıq işlənmiş maşınlar.' },
  );

  const similar = useMemo(() => {
    if (!car || !all) return [];
    return all
      .filter((c) => c.id !== car.id && c.status !== 'satildi')
      .sort(
        (a, b) =>
          Number(b.brand === car.brand) - Number(a.brand === car.brand) ||
          Math.abs(a.price - car.price) - Math.abs(b.price - car.price),
      )
      .slice(0, 4);
  }, [car, all]);

  if (loading) return <PageSpinner />;
  if (error) return <div className="container-x py-20 text-center">Xəta baş verdi. Səhifəni yenilə 🙏</div>;
  if (!car) return <NotFound />;

  const title = carTitle(car);
  const images = car.car_images.map((i) => ({ full: publicImageUrl(i.path), thumb: publicImageUrl(i.thumb) }));
  const sold = car.status === 'satildi';

  return (
    <article className="pb-28 md:pb-0">
      <div className="container-x hidden py-4 md:block">
        <Link to="/kataloq" className="inline-flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-white">
          <ChevronLeft className="size-4" /> Kataloqa qayıt
        </Link>
      </div>

      <div className="md:container-x md:grid md:grid-cols-[1.4fr_1fr] md:gap-8">
        <Gallery images={images} alt={`${title} ${car.year}`} overlay={<StatusStamp status={car.status} />} />

        <div className="container-x mt-5 space-y-5 md:mt-0 md:px-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusPill status={car.status} />
              <span className="text-sm text-mute">{car.year}-ci il</span>
            </div>
            <h1 className="font-display text-3xl leading-tight font-black uppercase sm:text-4xl">{title}</h1>
            <PriceTag price={car.price} size="lg" struck={sold} />
            {sold && (
              <p className="rounded-xl bg-flame/10 p-3 text-sm text-white/80">
                Bu maşın artıq yeni sahibinə çatıb 🎉 Oxşarını axtarırsan — yaz, tapaq!
              </p>
            )}
          </div>

          <div className="hidden flex-col gap-3 md:flex">
            <WhatsAppButton car={car} />
            {!sold && <CallButton car={car} />}
          </div>

          <SpecTable car={car} />

          <p className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="size-4 text-ember" /> {SITE.address} — {SITE.addressNote.toLowerCase()}
          </p>
        </div>
      </div>

      <div className="container-x mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        {car.description && (
          <section>
            <h2 className="mb-3 text-xl font-black">{SITE.owner} nə deyir? 🗣️</h2>
            <p className="rounded-2xl bg-coal p-4 leading-relaxed whitespace-pre-line text-white/85 ring-1 ring-white/5">
              {car.description}
            </p>
          </section>
        )}
        {car.tiktok_url && (
          <section>
            <h2 className="mb-3 text-xl font-black">TikTok videosu</h2>
            <TikTokEmbed url={car.tiktok_url} />
          </section>
        )}
      </div>

      {similar.length > 0 && (
        <section className="container-x mt-14">
          <SectionTitle kicker="Bunlar da yanır 🔥">Oxşar maşınlar</SectionTitle>
          <CarGrid cars={similar} />
          <div className="mt-6 text-center">
            <ButtonLink to="/kataloq" variant="ghost">
              Bütün kataloq
            </ButtonLink>
          </div>
        </section>
      )}

      {/* Mobil: sabit alt panel — maşının adı və qiyməti WhatsApp mesajına avtomatik yazılır */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden">
        <div className="flex gap-2 p-2.5">
          {!sold && <CallButton car={car} className="flex-1 !px-3" />}
          <WhatsAppButton car={car} compact className="flex-[1.4] !px-3" />
        </div>
      </div>
    </article>
  );
}
