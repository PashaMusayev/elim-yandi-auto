import { ArrowRight } from 'lucide-react';
import { SITE } from '@/config/site';
import { ButtonA, ButtonLink } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { PriceTag } from '@/components/ui/PriceTag';
import { generalWhatsAppText, waLink } from '@/lib/whatsapp';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* alov parıltısı */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-fire opacity-25 blur-[120px]"
      />
      <div className="container-x relative grid gap-10 pt-10 pb-14 md:grid-cols-[1.2fr_1fr] md:items-center md:pt-20 md:pb-24">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-bold ring-1 ring-white/10">
            <span className="size-2 rounded-full bg-wa" /> {SITE.tiktok.followers} izləyici artıq bizimlədir
          </p>
          <h1 className="font-display text-[2.6rem] leading-[1.02] font-black tracking-tight uppercase sm:text-6xl lg:text-7xl">
            Əlim yandı —<br />
            <span className="text-fire">qiymət yandı!</span> 🔥
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/75">
            {SITE.owner} maşınları özü seçir, özü yoxlayır, qiyməti isə… yandırır. Babəkdə gəl, bax, bəyən — minib get!
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/kataloq" className="text-lg">
              Maşınlara bax <ArrowRight className="size-5" />
            </ButtonLink>
            <ButtonA href={waLink(generalWhatsAppText)} target="_blank" rel="noopener" variant="ghost" className="text-lg">
              <WhatsAppIcon className="size-5 text-wa" /> WhatsApp-da yaz
            </ButtonA>
          </div>
        </div>

        {/* Loqo / video placeholder */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-[9/14] overflow-hidden rounded-3xl bg-coal ring-1 ring-white/10">
            <img src="/placeholder-car.svg" alt="" className="size-full object-cover opacity-80" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-xs font-bold">
              <img src="/logo-placeholder.svg" alt="Loqo üçün yer" className="h-8" />
              <span className="rounded bg-black/60 px-2 py-1">{SITE.tiktok.handle}</span>
            </div>
            <div className="absolute inset-x-4 bottom-5 space-y-2">
              <p className="font-display text-2xl font-black uppercase drop-shadow">Mercedes E280</p>
              <PriceTag price={18500} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
