import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { SITE } from '@/config/site';
import { btn } from '@/components/ui/Button';

/** Xəritə yalnız toxunanda yüklənir — Google Maps iframe ağırdır (~1 MB). */
export function MapBlock({ title = 'Bizi necə tapmaq olar?' }: { title?: string }) {
  const [show, setShow] = useState(false);
  return (
    <section className="container-x">
      <h2 className="mb-4 font-display text-2xl font-black uppercase sm:text-3xl">{title}</h2>
      <div className="overflow-hidden rounded-3xl bg-coal ring-1 ring-white/5">
        <div className="relative aspect-[4/3] sm:aspect-[21/9]">
          {show ? (
            <iframe
              title="Elim Yandı Auto — xəritə"
              src={SITE.mapsEmbed}
              className="absolute inset-0 size-full border-0 grayscale-[.3] invert-[.9] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setShow(true)}
              className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,#2a1a12,#141414)]"
            >
              <span className="flex flex-col items-center gap-2">
                <MapPin className="size-10 text-flame" />
                <span className="font-bold">Xəritəni göstər</span>
              </span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">{SITE.address}</p>
            <p className="text-sm text-mute">{SITE.addressNote}</p>
          </div>
          <a href={SITE.mapsLink} target="_blank" rel="noopener" className={btn('fire')}>
            <Navigation className="size-4" /> Yol göstər
          </a>
        </div>
      </div>
    </section>
  );
}
