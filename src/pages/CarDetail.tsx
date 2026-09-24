import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CarDetailView } from '@/components/car/CarDetailView';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { SITE } from '@/config/site';
import { useAsync } from '@/hooks/useAsync';
import { useSeo } from '@/hooks/useSeo';
import { fetchCarBySlug, fetchCars } from '@/lib/cars';
import { carSeo } from '@/lib/seo';
import NotFound from './NotFound';

/** Birbaşa linklə açılan elan səhifəsi (paylaşılan linklər, Google). Saytın içində isə elan modalda açılır. */
export default function CarDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data: car, loading, error } = useAsync(() => fetchCarBySlug(slug), [slug]);
  const { data: all } = useAsync(() => fetchCars(), []);

  const seo = useMemo(() => (car ? carSeo(car, SITE.url) : null), [car]);
  useSeo(seo ?? { title: 'Maşın', description: 'Elim Yandı Auto — Bakıda satılıq işlənmiş maşınlar.' });

  if (loading) return <PageSpinner />;
  if (error) return <div className="container-x py-20 text-center">Xəta baş verdi. Səhifəni yenilə 🙏</div>;
  if (!car) return <NotFound />;

  const back = () => {
    if ((window.history.state as { idx?: number } | null)?.idx) navigate(-1);
    else navigate('/kataloq');
  };

  return (
    <article className="mx-auto max-w-6xl pb-24 md:pb-0">
      <CarDetailView car={car} allCars={all} variant="page" onBack={back} />
    </article>
  );
}
