import type { Car, CarWithImages } from '@/types/car';
import { FUEL_LABEL, GEARBOX_LABEL } from '@/types/car';
import { formatNumber } from './format';
import { publicImageUrl } from './supabase';

/** "Bakıda satılıq Mercedes-Benz E280, 2008 — 18.500 AZN" tipli SEO məlumatı. */
export function carSeo(car: CarWithImages | Car, siteUrl: string) {
  const name = `${car.brand} ${car.model}`;
  const price = `${formatNumber(car.price)} AZN`;
  const sold = car.status === 'satildi';
  const title = sold ? `${name} ${car.year} — satıldı` : `Bakıda satılıq ${name}, ${car.year} — ${price}`;
  const specs = [
    car.engine_l ? `${car.engine_l.toFixed(1)} L` : null,
    FUEL_LABEL[car.fuel].toLowerCase(),
    GEARBOX_LABEL[car.gearbox].toLowerCase(),
    car.mileage_km != null ? `${formatNumber(car.mileage_km)} km` : null,
  ]
    .filter(Boolean)
    .join(', ');
  const description = `${name} ${car.year}, ${specs}. Qiymət: ${price}. Elim Yandı Auto — Bakı, Babək. WhatsApp və zəng: 055 200 04 38.`;
  const firstImage = 'car_images' in car && car.car_images[0] ? car.car_images[0].path : car.cover_thumb;
  const image = publicImageUrl(firstImage);
  const path = `/masin/${car.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${name} ${car.year}`,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    fuelType: FUEL_LABEL[car.fuel],
    vehicleTransmission: GEARBOX_LABEL[car.gearbox],
    ...(car.mileage_km != null && {
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage_km, unitCode: 'KMT' },
    }),
    image: image.startsWith('/') ? `${siteUrl}${image}` : image,
    url: `${siteUrl}${path}`,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'AZN',
      availability: sold ? 'https://schema.org/SoldOut' : car.status === 'rezerv' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      seller: { '@type': 'AutoDealer', name: 'Elim Yandı Auto' },
    },
  };

  return { title, description, image, path, jsonLd };
}
