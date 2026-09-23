import { Link } from 'react-router';
import { MapPin, Phone } from 'lucide-react';
import { SITE } from '@/config/site';
import { InstagramIcon, TikTokIcon } from '@/components/ui/BrandIcons';
import { Logo } from './Logo';
import { NAV } from './Header';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-coal">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-mute">
            Əlim yandı — qiymət yandı! 🔥 {SITE.ownerGenitive} salonu. Bakıda sərfəli işlənmiş avtomobillər.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white/60 uppercase">Səhifələr</h3>
          <ul className="space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-ember">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white/60 uppercase">Əlaqə</h3>
          <ul className="space-y-2 text-sm">
            {SITE.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="flex items-center gap-2 hover:text-ember">
                  <Phone className="size-4 text-ember" /> {p.display}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ember" />
              <span>
                {SITE.address}
                <span className="block text-xs text-mute">{SITE.addressNote}</span>
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold tracking-wide text-white/60 uppercase">Bizi izləyin</h3>
          <div className="flex gap-2">
            <a
              href={SITE.tiktok.url}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              <TikTokIcon className="size-4" /> {SITE.tiktok.handle}
            </a>
            {SITE.instagram && (
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10"
              >
                <InstagramIcon className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 pb-24 text-center text-xs text-mute md:pb-5">
        © {new Date().getFullYear()} {SITE.name}. Rəsmi sayt — başqa filialımız yoxdur.
      </div>
    </footer>
  );
}
