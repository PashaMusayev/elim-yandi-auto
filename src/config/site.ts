/** Bütün biznes məlumatları bir yerdə — dəyişmək üçün yalnız bu faylı redaktə edin. */
export const SITE = {
  name: 'Elim Yandı Auto',
  owner: 'Nihad',
  ownerGenitive: 'Nihadın',
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://elimyandi.az',
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
  /** Google Maps: dəqiq pin gələndə `mapsEmbed` və `mapsLink`-i yeniləyin. */
  mapsLink: 'https://maps.google.com/?q=Babək+prospekti,+Bakı',
  mapsEmbed: 'https://www.google.com/maps?q=Babək+prospekti,+Bakı&output=embed',
  priceRange: { min: 6900, max: 75000 },
} as const;

export const PRIMARY_PHONE = SITE.phones[0];
