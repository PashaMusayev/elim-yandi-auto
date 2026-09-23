import { Link } from 'react-router';
import { LayoutGrid, Phone } from 'lucide-react';
import { PRIMARY_PHONE } from '@/config/site';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { generalWhatsAppText, waLink } from '@/lib/whatsapp';

/** Mobil ekranda sabit alt panel: Zəng | WhatsApp | Kataloq. Maşın səhifəsində öz paneli var. */
export function MobileBottomBar() {
  const item = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-bold';
  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur-md md:hidden"
      aria-label="Tez əlaqə"
    >
      <div className="flex h-16 items-stretch gap-2 px-2 pt-1">
        <a href={`tel:${PRIMARY_PHONE.tel}`} className={`${item} text-white`}>
          <Phone className="size-5" /> Zəng
        </a>
        <a
          href={waLink(generalWhatsAppText)}
          target="_blank"
          rel="noopener"
          className={`${item} -mt-4 rounded-2xl bg-wa text-black shadow-[0_-4px_20px_rgba(37,211,102,.35)]`}
        >
          <WhatsAppIcon className="size-6" /> WhatsApp
        </a>
        <Link to="/kataloq" className={`${item} text-white`}>
          <LayoutGrid className="size-5" /> Kataloq
        </Link>
      </div>
    </nav>
  );
}
