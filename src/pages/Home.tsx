import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { CarGrid } from '@/components/car/CarCard';
import { Hero } from '@/components/home/Hero';
import { MapBlock } from '@/components/home/MapBlock';
import { TikTokStats } from '@/components/home/TikTokStats';
import { TrustBlock } from '@/components/home/TrustBlock';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ButtonLink } from '@/components/ui/Button';
import { SITE } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { useSeo } from '@/hooks/useSeo';
import { fetchCars } from '@/lib/cars';

export default function Home() {
  useSeo({
    title: 'Elim Yandı Auto — Bakıda satılıq işlənmiş avtomobillər | Babək',
    description: `Bakıda sərfəli qiymətə satılıq işlənmiş Mercedes, BMW, Toyota və digər maşınlar. ${SITE.tiktok.followers} TikTok izləyicisinin etibar etdiyi salon. Yeganə ünvan: Babək. ☎ ${SITE.phones[0].display}`,
    path: '/',
  });
  const { data, loading } = useAsync(() => fetchCars(), []);
  const fresh = data?.filter((c) => c.status !== 'satildi').slice(0, 8);
  const soldCount = data?.filter((c) => c.status === 'satildi').length ?? 0;

  return (
    <div className="space-y-14 sm:space-y-20">
      <Hero />
      <TikTokStats />
      <section className="container-x">
        <SectionTitle
          kicker="Təzə-təzə 🔥"
          action={
            <Link to="/kataloq" className="hidden items-center gap-1 text-sm font-bold text-ember sm:flex">
              Hamısı <ArrowRight className="size-4" />
            </Link>
          }
        >
          Yeni gələn maşınlar
        </SectionTitle>
        <CarGrid cars={fresh} loading={loading} skeletons={4} />
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <ButtonLink to="/kataloq" variant="ghost" className="w-full sm:w-auto">
            Bütün kataloqa bax <ArrowRight className="size-4" />
          </ButtonLink>
          {soldCount > 0 && (
            <p className="text-sm text-mute">
              Artıq {soldCount} maşın yeni sahibinə çatıb — sıra səndədir 😉
            </p>
          )}
        </div>
      </section>
      <TrustBlock />
      <MapBlock />
    </div>
  );
}
