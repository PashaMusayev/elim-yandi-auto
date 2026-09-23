import { SITE } from '@/config/site';
import type { Car } from '@/types/car';
import { carTitle, formatPrice } from './format';

export function waLink(text: string, phone: string = SITE.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function carWhatsAppText(car: Pick<Car, 'brand' | 'model' | 'year' | 'price' | 'slug'>): string {
  return [
    `Salam ${SITE.owner}! 🔥`,
    `Saytda bu maşına baxıram: ${carTitle(car)} (${car.year}) — ${formatPrice(car.price)}.`,
    `Hələ satışdadır?`,
    `${SITE.url}/masin/${car.slug}`,
  ].join('\n');
}

export const generalWhatsAppText = `Salam ${SITE.owner}! Saytdan yazıram, maşınlar barədə məlumat almaq istəyirəm 🚗`;
