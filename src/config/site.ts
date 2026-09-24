/** Bütün biznes məlumatları bir yerdə — dəyişmək üçün yalnız bu faylı redaktə edin. */
export const SITE = {
  name: 'Elim Yandı Auto',
  owner: 'Nihad',
  ownerGenitive: 'Nihadın',
  url: (import.meta.env.VITE_SITE_URL || 'https://elimyandi.az').replace(/\/+$/, ''),
  city: 'Bakı',
  address: 'Babək prospekti, Bakı',
  addressNote: 'Yeganə filial — başqa filialımız yoxdur!',
  phones: [
    { display: '055 200 04 38', tel: '+994552000438' },
    { display: '055 200 04 47', tel: '+994552000447' },
  ],
  /** WhatsApp mesajları bu nömrəyə gedir (beynəlxalq format, + olmadan). */
  whatsapp: '994552000438',
  hours: [
    { days: 'Bazar ertəsi – Şənbə', time: '10:00 – 20:00' },
    { days: 'Bazar', time: '11:00 – 18:00' },
  ],
  tiktok: {
    handle: '@elimyandi.auto',
    url: 'https://www.tiktok.com/@elimyandi.auto',
    followers: '388K',
    likes: '14M',
  },
  instagram: null as string | null,
  youtube: null as string | null,
  /** Salonun dəqiq yeri: 40°23'40.7"N 49°58'01.7"E */
  coords: { lat: 40.394639, lng: 49.967139 },
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=40.394639,49.967139',
  mapsEmbed: 'https://www.google.com/maps?q=40.394639,49.967139&z=17&output=embed',
  priceRange: { min: 6900, max: 75000 },
} as const;

export const PRIMARY_PHONE = SITE.phones[0];
