import { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { CarDetailView } from '@/components/car/CarDetailView';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useCarModal } from '@/hooks/useCarModal';
import { fetchCarBySlug, fetchCars } from '@/lib/cars';
import { carTitle, formatNumber } from '@/lib/format';
import { lockScroll } from '@/lib/scrollLock';
import { SITE } from '@/config/site';

function ModalBody({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data: car, loading, error, reload } = useAsync(() => fetchCarBySlug(slug), [slug]);
  const { data: all } = useAsync(() => fetchCars(), []);

  // Modal açıq olanda brauzer tabının başlığı maşının adı olsun, bağlananda əvvəlkinə qayıtsın
  useEffect(() => {
    if (!car) return;
    const prev = document.title;
    document.title = `${carTitle(car)}, ${car.year} — ${formatNumber(car.price)} AZN | ${SITE.name}`;
    return () => {
      document.title = prev;
    };
  }, [car]);

  if (loading) {
    return (
      <div className="grid h-full place-items-center" role="status" aria-label="Yüklənir">
        <Flame className="size-10 animate-flicker text-ember" />
      </div>
    );
  }
  if (error || !car) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <p className="text-4xl">🤷‍♂️</p>
          <p className="mt-3 font-bold">{error ? 'Elanı yükləmək olmadı.' : 'Bu elan tapılmadı — bəlkə artıq silinib.'}</p>
          <div className="mt-5 flex justify-center gap-2">
            {error && <Button onClick={reload}>Yenidən cəhd et</Button>}
            <Button variant="ghost" onClick={onClose}>
              Bağla
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <CarDetailView car={car} allCars={all} variant="modal" onBack={onClose} onClose={onClose} />;
}

/** Kosalar üslubu: elan səhifəni dəyişmədən pəncərədə açılır. Mobildə tam ekran. */
export function CarModalHost() {
  const { slug, close } = useCarModal();

  useEffect(() => {
    if (!slug) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      // Qalereyanın tam ekran rejimi öz Escape-ini idarə edir
      if (e.key === 'Escape' && !document.querySelector('[aria-label="Şəkillər"][aria-modal="true"]')) close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [slug, close]);

  if (!slug) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm md:p-6"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Elan"
    >
      <div
        className="relative h-dvh w-full max-w-6xl overflow-hidden bg-ink md:h-[90vh] md:rounded-2xl md:ring-1 md:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalBody key={slug} slug={slug} onClose={close} />
      </div>
    </div>
  );
}
