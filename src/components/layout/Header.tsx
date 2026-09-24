import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Menu, Phone, X } from 'lucide-react';
import { PRIMARY_PHONE, SITE } from '@/config/site';
import { TikTokIcon } from '@/components/ui/BrandIcons';
import { Logo } from './Logo';

export const NAV = [
  { to: '/', label: 'Ana səhifə' },
  { to: '/kataloq', label: 'Kataloq' },
  { to: '/haqqimizda', label: 'Haqqımızda' },
  { to: '/elaqe', label: 'Əlaqə' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Əsas menyu">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'text-ember' : 'text-white/80 hover:text-white'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={SITE.tiktok.url}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:text-white sm:flex"
          >
            <TikTokIcon className="size-4" /> {SITE.tiktok.followers}
          </a>
          <a
            href={`tel:${PRIMARY_PHONE.tel}`}
            className="hidden items-center gap-2 rounded-xl bg-fire px-4 py-2.5 text-sm font-bold md:flex"
          >
            <Phone className="size-4" /> {PRIMARY_PHONE.display}
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-lg bg-white/5 md:hidden"
            aria-label={open ? 'Menyunu bağla' : 'Menyunu aç'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/5 bg-ink md:hidden" aria-label="Mobil menyu">
          <ul className="container-x py-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 text-lg font-bold ${isActive ? 'text-ember' : 'text-white'}`
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
