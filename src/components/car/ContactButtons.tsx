import { Phone } from 'lucide-react';
import { PRIMARY_PHONE } from '@/config/site';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { btn } from '@/components/ui/Button';
import { track } from '@/lib/track';
import { carWhatsAppText, waLink } from '@/lib/whatsapp';
import type { Car } from '@/types/car';

export function WhatsAppButton({ car, className = '', compact = false }: { car: Car; className?: string; compact?: boolean }) {
  const sold = car.status === 'satildi';
  const text = sold
    ? `Salam! Saytda gördüm ki, ${car.brand} ${car.model} (${car.year}) satılıb. Buna oxşar maşın var? 🙏`
    : carWhatsAppText(car);
  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noopener"
      onClick={() => track(car.id, 'whatsapp')}
      className={btn('wa', `text-lg whitespace-nowrap ${className}`)}
    >
      <WhatsAppIcon className="size-6" /> {sold ? 'Oxşarını soruş' : compact ? 'WhatsApp' : 'WhatsApp-da yaz'}
    </a>
  );
}

export function CallButton({
  car,
  className = '',
  phone = PRIMARY_PHONE,
  label = 'Zəng et',
}: {
  car: Car;
  className?: string;
  phone?: { tel: string; display: string };
  label?: string;
}) {
  return (
    <a href={`tel:${phone.tel}`} onClick={() => track(car.id, 'call')} className={btn('fire', `text-lg whitespace-nowrap ${className}`)}>
      <Phone className="size-5" /> {label}
    </a>
  );
}
