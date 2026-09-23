-- Avtomatik yaradılıb: scripts/gen-seed.ts. Əl ilə redaktə etməyin.
insert into public.cars
  (slug, brand, model, year, price, engine_l, engine_hp, fuel, gearbox, mileage_km,
   body_type, color, drive, description, tiktok_url, status, is_featured, created_at)
values
  ('bmw-x5-xdrive40i-2019-a1k9', 'BMW', 'X5 xDrive40i', 2019, 75000, 3, 340, 'benzin', 'avtomat', 98000, 'Yolsuzluq', 'Qara', 'Tam', 'Maşın yox, kosmik gəmidir 🚀 Panorama, ventilyasiyalı oturacaqlar, Harman Kardon. Servis tarixçəsi əldə. Bu qiymətə X5 — əlim yandı, vallah!', null, 'satishda', true, now() - interval '1 days'),
  ('mercedes-gle-350d-2016-p2m4', 'Mercedes-Benz', 'GLE 350d', 2016, 58000, 3, 258, 'dizel', 'avtomat', 156000, 'Yolsuzluq', 'Ağ', 'Tam', 'Dizel, 4MATIC, pnevmo asqı. Sahibi özü gəlib apardı — təşəkkürlər! 🙌', null, 'satildi', false, now() - interval '12 days'),
  ('kia-sportage-2017-q8d1', 'Kia', 'Sportage', 2017, 29900, 2, 185, 'dizel', 'avtomat', 142000, 'Krossover', 'Boz', 'Tam', 'Ailə üçün ideal krossover. Yanacağa qənaətcil dizel, tam ötürücü. Boyasız, vurulmayıb.', null, 'satishda', false, now() - interval '3 days'),
  ('bmw-528i-2012-z3n7', 'BMW', '528i', 2012, 26500, 2, 245, 'benzin', 'avtomat', 188000, 'Sedan', 'Tünd göy', 'Arxa', 'F10 kuzov, M paket görünüşü. Sürməyə doyulmur — sürücü üçün maşın 😎', null, 'rezerv', false, now() - interval '5 days'),
  ('mercedes-e280-2008-x7k2', 'Mercedes-Benz', 'E280', 2008, 18500, 3, 231, 'benzin', 'avtomat', 265000, 'Sedan', 'Gümüşü', 'Arxa', 'Əfsanəvi W211. Motor saat kimi işləyir, salon təmizdir. "Yeşka" axtaran — tapdın! 🔥', null, 'satishda', true, now() - interval '0 days'),
  ('toyota-prius-2013-h5c8', 'Toyota', 'Prius', 2013, 16900, 1.8, 136, 'hibrid', 'variator', 230000, 'Hetçbek', 'Ağ', 'Ön', 'Taksi üçün, gündəlik iş üçün — benzin pulunu cibində saxla. Batareya yoxlanılıb ✅', null, 'satishda', false, now() - interval '2 days'),
  ('hyundai-elantra-2012-r4t6', 'Hyundai', 'Elantra', 2012, 13500, 1.8, 150, 'benzin', 'avtomat', 198000, 'Sedan', 'Qırmızı', 'Ön', 'Etibarlı, ehtiyat hissəsi ucuz, avtomat. İlk maşın üçün əla seçim.', null, 'satishda', false, now() - interval '8 days'),
  ('opel-astra-2006-b9w2', 'Opel', 'Astra', 2006, 6900, 1.6, 105, 'benzin', 'mexanika', 245000, 'Hetçbek', 'Qara', 'Ön', 'Bu qiymətə maşın? Bəli! 6.900 AZN — minib gedirsən. Kondisioner işləyir 😄', null, 'satishda', false, now() - interval '4 days')
on conflict (slug) do nothing;
