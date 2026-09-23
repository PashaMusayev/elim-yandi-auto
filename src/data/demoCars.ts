import type { CarWithImages } from '@/types/car';

/**
 * Nümunə maşınlar. Supabase qoşulmayanda sayt bunları göstərir,
 * `npm run seed:sql` isə eyni məlumatdan supabase/seed.sql yaradır.
 */
type Demo = Omit<CarWithImages, 'id' | 'cover_thumb' | 'sold_at' | 'updated_at' | 'car_images'> & { daysAgo: number };

const demo: Demo[] = [
  {
    slug: 'bmw-x5-xdrive40i-2019-a1k9', brand: 'BMW', model: 'X5 xDrive40i', year: 2019, price: 75000,
    engine_l: 3.0, engine_hp: 340, fuel: 'benzin', gearbox: 'avtomat', mileage_km: 98000,
    body_type: 'Yolsuzluq', color: 'Qara', drive: 'Tam',
    description: 'Maşın yox, kosmik gəmidir 🚀 Panorama, ventilyasiyalı oturacaqlar, Harman Kardon. Servis tarixçəsi əldə. Bu qiymətə X5 — əlim yandı, vallah!',
    tiktok_url: null, status: 'satishda', is_featured: true, created_at: '', daysAgo: 1,
  },
  {
    slug: 'mercedes-gle-350d-2016-p2m4', brand: 'Mercedes-Benz', model: 'GLE 350d', year: 2016, price: 58000,
    engine_l: 3.0, engine_hp: 258, fuel: 'dizel', gearbox: 'avtomat', mileage_km: 156000,
    body_type: 'Yolsuzluq', color: 'Ağ', drive: 'Tam',
    description: 'Dizel, 4MATIC, pnevmo asqı. Sahibi özü gəlib apardı — təşəkkürlər! 🙌',
    tiktok_url: null, status: 'satildi', is_featured: false, created_at: '', daysAgo: 12,
  },
  {
    slug: 'kia-sportage-2017-q8d1', brand: 'Kia', model: 'Sportage', year: 2017, price: 29900,
    engine_l: 2.0, engine_hp: 185, fuel: 'dizel', gearbox: 'avtomat', mileage_km: 142000,
    body_type: 'Krossover', color: 'Boz', drive: 'Tam',
    description: 'Ailə üçün ideal krossover. Yanacağa qənaətcil dizel, tam ötürücü. Boyasız, vurulmayıb.',
    tiktok_url: null, status: 'satishda', is_featured: false, created_at: '', daysAgo: 3,
  },
  {
    slug: 'bmw-528i-2012-z3n7', brand: 'BMW', model: '528i', year: 2012, price: 26500,
    engine_l: 2.0, engine_hp: 245, fuel: 'benzin', gearbox: 'avtomat', mileage_km: 188000,
    body_type: 'Sedan', color: 'Tünd göy', drive: 'Arxa',
    description: 'F10 kuzov, M paket görünüşü. Sürməyə doyulmur — sürücü üçün maşın 😎',
    tiktok_url: null, status: 'rezerv', is_featured: false, created_at: '', daysAgo: 5,
  },
  {
    slug: 'mercedes-e280-2008-x7k2', brand: 'Mercedes-Benz', model: 'E280', year: 2008, price: 18500,
    engine_l: 3.0, engine_hp: 231, fuel: 'benzin', gearbox: 'avtomat', mileage_km: 265000,
    body_type: 'Sedan', color: 'Gümüşü', drive: 'Arxa',
    description: 'Əfsanəvi W211. Motor saat kimi işləyir, salon təmizdir. "Yeşka" axtaran — tapdın! 🔥',
    tiktok_url: null, status: 'satishda', is_featured: true, created_at: '', daysAgo: 0,
  },
  {
    slug: 'toyota-prius-2013-h5c8', brand: 'Toyota', model: 'Prius', year: 2013, price: 16900,
    engine_l: 1.8, engine_hp: 136, fuel: 'hibrid', gearbox: 'variator', mileage_km: 230000,
    body_type: 'Hetçbek', color: 'Ağ', drive: 'Ön',
    description: 'Taksi üçün, gündəlik iş üçün — benzin pulunu cibində saxla. Batareya yoxlanılıb ✅',
    tiktok_url: null, status: 'satishda', is_featured: false, created_at: '', daysAgo: 2,
  },
  {
    slug: 'hyundai-elantra-2012-r4t6', brand: 'Hyundai', model: 'Elantra', year: 2012, price: 13500,
    engine_l: 1.8, engine_hp: 150, fuel: 'benzin', gearbox: 'avtomat', mileage_km: 198000,
    body_type: 'Sedan', color: 'Qırmızı', drive: 'Ön',
    description: 'Etibarlı, ehtiyat hissəsi ucuz, avtomat. İlk maşın üçün əla seçim.',
    tiktok_url: null, status: 'satishda', is_featured: false, created_at: '', daysAgo: 8,
  },
  {
    slug: 'opel-astra-2006-b9w2', brand: 'Opel', model: 'Astra', year: 2006, price: 6900,
    engine_l: 1.6, engine_hp: 105, fuel: 'benzin', gearbox: 'mexanika', mileage_km: 245000,
    body_type: 'Hetçbek', color: 'Qara', drive: 'Ön',
    description: 'Bu qiymətə maşın? Bəli! 6.900 AZN — minib gedirsən. Kondisioner işləyir 😄',
    tiktok_url: null, status: 'satishda', is_featured: false, created_at: '', daysAgo: 4,
  },
];

export const DEMO_CARS_RAW = demo;

export const DEMO_CARS: CarWithImages[] = demo.map(({ daysAgo, ...c }, i) => {
  const created = new Date(Date.now() - daysAgo * 864e5 - i * 36e5).toISOString();
  return {
    ...c,
    id: `demo-${i + 1}`,
    cover_thumb: null,
    sold_at: c.status === 'satildi' ? created : null,
    created_at: created,
    updated_at: created,
    car_images: [],
  };
});
