import { useEffect } from 'react';
import { Eye, Heart, Trash2, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/Button';
import { useAsync } from '@/hooks/useAsync';
import { useCarModal } from '@/hooks/useCarModal';
import { fetchCars } from '@/lib/cars';
import { favorites, useFavorites } from '@/lib/favorites';
import { carTitle, formatNumber } from '@/lib/format';
import { lockScroll } from '@/lib/scrollLock';
import { publicImageUrl } from '@/lib/supabase';
import { track } from '@/lib/track';
import { carWhatsAppText, waLink } from '@/lib/whatsapp';

/** Sağdan açılan "Seçilmiş avtomobillər" çekməcəsi (Kosalar üslubu). */
export function FavoritesDrawer() {
  const { ids, drawerOpen } = useFavorites();
  const { open } = useCarModal();
  const { data: all } = useAsync(() => (drawerOpen ? fetchCars() : Promise.resolve(undefined)), [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const unlock = lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && favorites.closeDrawer();
    window.addEventListener('keydown', onKey);
    return () => {
      unlock();
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  // Seçilmə ardıcıllığı ilə (sonuncu əlavə olunan yuxarıda)
  const cars = ids.map((id) => all?.find((c) => c.id === id)).filter((c) => c !== undefined);

  const view = (slug: string) => {
    favorites.closeDrawer();
    open(slug);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={favorites.closeDrawer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Seçilmiş avtomobillər"
        className="flex h-full w-full max-w-md flex-col bg-ink ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-coal p-4">
          <h2 className="flex items-center gap-2.5 text-lg font-black">
            <Heart className="size-5 fill-flame text-flame" /> Seçilmiş avtomobillər ({cars.length})
          </h2>
          <button
            type="button"
            onClick={favorites.closeDrawer}
            className="grid size-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10"
            aria-label="Bağla"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
          {cars.length === 0 ? (
            <div className="space-y-3 py-16 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/5 text-white/40">
                <Heart className="size-8" />
              </div>
              <p className="font-bold">Hələ ki, seçilmiş avtomobil yoxdur.</p>
              <p className="mx-auto max-w-xs text-sm text-white/55">
                Bəyəndiyin maşının şəklindəki ❤️ ikonasına bas — burada saxlanılacaq.
              </p>
            </div>
          ) : (
            cars.map((car) => (
              <div key={car.id} className="flex items-center gap-3 rounded-2xl bg-coal p-3 ring-1 ring-white/5">
                <img
                  src={publicImageUrl(car.cover_thumb)}
                  alt={carTitle(car)}
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = '/placeholder-car.svg')}
                  className="h-16 w-20 shrink-0 rounded-xl bg-smoke object-cover"
                />
                <button type="button" onClick={() => view(car.slug)} className="min-w-0 flex-1 text-left">
                  <span className="rounded bg-ember/15 px-2 py-0.5 text-[10px] font-bold text-ember">{car.year}-ci il</span>
                  {car.status === 'satildi' && (
                    <span className="ml-1 rounded bg-flame/15 px-2 py-0.5 text-[10px] font-bold text-flame">Satıldı</span>
                  )}
                  <span className="mt-1 block truncate text-sm font-bold">{carTitle(car)}</span>
                  <span className="block text-sm font-black text-ember">{formatNumber(car.price)} AZN</span>
                </button>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => view(car.slug)}
                    className="grid size-8 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
                    aria-label="Bax"
                  >
                    <Eye className="size-4" />
                  </button>
                  <a
                    href={waLink(carWhatsAppText(car))}
                    target="_blank"
                    rel="noopener"
                    onClick={() => track(car.id, 'whatsapp')}
                    className="grid size-8 place-items-center rounded-lg bg-wa text-black"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => favorites.remove(car.id)}
                    className="grid size-8 place-items-center rounded-lg bg-flame/15 text-flame hover:bg-flame/25"
                    aria-label="Sil"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cars.length > 0 && (
          <div className="border-t border-white/10 p-4">
            <Button onClick={favorites.closeDrawer} className="w-full">
              Kataloqa qayıt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Başlıqdakı ❤️ düyməsi — sayğacla. */
export function FavoritesButton() {
  const { ids } = useFavorites();
  return (
    <button
      type="button"
      onClick={favorites.openDrawer}
      className="relative grid size-10 place-items-center rounded-lg bg-white/5 hover:bg-white/10"
      aria-label={`Seçilmişlər (${ids.length})`}
    >
      <Heart className={`size-5 ${ids.length ? 'fill-flame text-flame' : ''}`} />
      {ids.length > 0 && (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-fire px-1 text-[11px] font-black">
          {ids.length}
        </span>
      )}
    </button>
  );
}
