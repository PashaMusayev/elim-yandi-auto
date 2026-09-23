import { SITE } from '@/config/site';
import { TikTokIcon } from '@/components/ui/BrandIcons';
import { btn } from '@/components/ui/Button';

const STATS = [
  { value: SITE.tiktok.followers, label: 'TikTok izləyici' },
  { value: SITE.tiktok.likes, label: 'bəyənmə' },
  { value: '1', label: 'ünvan — Babək' },
];

export function TikTokStats() {
  return (
    <section className="container-x">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-smoke to-coal p-6 ring-1 ring-white/5 sm:p-10">
        <TikTokIcon aria-hidden="true" className="absolute -top-6 -right-6 size-40 text-white/[.04]" />
        <div className="grid grid-cols-3 gap-3 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-black text-fire sm:text-5xl">{s.value}</p>
              <p className="mt-1 text-xs font-semibold text-white/70 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-white/80">
            Hər gün yeni maşın, yeni qiymət, yeni zarafat 😄 Videoları qaçırma!
          </p>
          <a href={SITE.tiktok.url} target="_blank" rel="noopener" className={btn('white', 'shrink-0')}>
            <TikTokIcon className="size-5" /> {SITE.tiktok.handle}
          </a>
        </div>
      </div>
    </section>
  );
}
