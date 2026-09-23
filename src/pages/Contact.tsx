import { Clock, MapPin, Phone } from 'lucide-react';
import { SITE } from '@/config/site';
import { MapBlock } from '@/components/home/MapBlock';
import { TikTokIcon, WhatsAppIcon } from '@/components/ui/BrandIcons';
import { btn } from '@/components/ui/Button';
import { useSeo } from '@/hooks/useSeo';
import { generalWhatsAppText, waLink } from '@/lib/whatsapp';

export default function Contact() {
  useSeo({
    title: 'Əlaqə — Elim Yandı Auto, Babək',
    description: `Elim Yandı Auto ilə əlaqə: ${SITE.phones.map((p) => p.display).join(', ')}. Ünvan: ${SITE.address}. İş saatları və xəritə.`,
  });

  return (
    <div className="space-y-12 py-8 sm:py-14">
      <div className="container-x">
        <h1 className="font-display text-4xl font-black uppercase sm:text-5xl">
          Əlaqə <span className="text-fire">📞</span>
        </h1>
        <p className="mt-2 text-lg text-white/70">Zəng et, yaz, ya da birbaşa gəl — çay hazırdır.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/5">
            <h2 className="mb-4 flex items-center gap-2 font-black">
              <Phone className="size-5 text-ember" /> Telefonlar
            </h2>
            <ul className="space-y-3">
              {SITE.phones.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`} className="block text-2xl font-black tabular-nums hover:text-ember">
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
            <a href={waLink(generalWhatsAppText)} target="_blank" rel="noopener" className={btn('wa', 'mt-5 w-full')}>
              <WhatsAppIcon className="size-5" /> WhatsApp-da yaz
            </a>
          </section>

          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/5">
            <h2 className="mb-4 flex items-center gap-2 font-black">
              <MapPin className="size-5 text-ember" /> Ünvan
            </h2>
            <p className="text-xl font-bold">{SITE.address}</p>
            <p className="mt-2 rounded-lg bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">⚠️ {SITE.addressNote}</p>
            <a href={SITE.tiktok.url} target="_blank" rel="noopener" className={btn('ghost', 'mt-5 w-full')}>
              <TikTokIcon className="size-5" /> {SITE.tiktok.handle}
            </a>
          </section>

          <section className="rounded-2xl bg-coal p-5 ring-1 ring-white/5">
            <h2 className="mb-4 flex items-center gap-2 font-black">
              <Clock className="size-5 text-ember" /> İş saatları
            </h2>
            <dl className="space-y-3">
              {SITE.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-3">
                  <dt className="text-white/65">{h.days}</dt>
                  <dd className="font-bold tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <MapBlock title="Xəritədə biz" />
    </div>
  );
}
