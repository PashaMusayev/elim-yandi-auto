# Elim Yandı Auto 🔥

Babəkdə yerləşən işlənmiş avtomobil salonu üçün mobil-first sayt.
**Stack:** React 19 + TypeScript + Vite + Tailwind v4, backend Supabase (Postgres + Storage + Auth).

## Tez başlanğıc

```bash
npm install
cp .env.example .env   # Supabase açarlarını yazın (boş qalsa sayt demo maşınlarla işləyir)
npm run dev
```

## Supabase qurulumu

1. [supabase.com](https://supabase.com)-da yeni layihə yaradın.
2. **SQL Editor** → əvvəl `supabase/migrations/0001_init.sql`, sonra `0002_grants.sql` faylını işə salın
   (cədvəllər, RLS, trigger-lər, `car-images` storage bucket).
3. Nümunə maşınlar üçün `supabase/seed.sql` faylını işə salın.
4. **Authentication → Users → Add user** ilə admin istifadəçisini (e-poçt + şifrə) yaradın.
5. Həmin istifadəçini admin edin:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'nihad@example.com';
   ```
6. **Project Settings → API**-dən `URL` və `anon` açarını `.env`-ə yazın.

## Deploy (Vercel)

1. Repo-nu Vercel-ə qoşun (framework: Vite).
2. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`.
3. `vercel.json` bunları edir:
   - `/masin/:slug` üçün `api/og.ts` funksiyası maşının adını, qiymətini və şəklini meta tag-lara yazır.
     WhatsApp, TikTok və Facebook link önizləmələri JavaScript işlətmədiyi üçün bu lazımdır.
   - qalan bütün route-ları SPA-ya (`index.html`) yönləndirir.

## Struktur

```
src/
  config/site.ts     ← telefonlar, ünvan, iş saatları, TikTok, xəritə (hamısı bir yerdə)
  data/demoCars.ts   ← 8 nümunə maşın (Supabase yoxdursa göstərilir; seed.sql bundan yaranır)
  lib/               ← supabase, whatsapp, filtrlər, SEO, şəkil sıxma (WebP), statistika
  components/        ← layout, ui (PriceTag, StatusBadge…), car, catalog, home
  pages/             ← Home, Catalog, CarDetail, About, Contact, admin/*
supabase/            ← migration + seed
api/og.ts            ← maşın səhifələri üçün server tərəfində meta tag-lar
```

## Admin panel (`/admin`)

- **Yeni maşın:** alt paneldəki böyük "+" düyməsi. Şəkil seç → marka/model/il/qiymət → "Əlavə et".
  Şəkillər brauzerdə WebP-yə sıxılır (1600px + 560px thumbnail) və paralel yüklənir.
- **Status:** siyahıda hər maşının altında bir toxunuşla *Satışda / Rezerv / Satıldı*.
  Satılanlar kataloqda "SATILDI" möhürü ilə qalır (sosial sübut üçün).
- **Statistika:** baxış, WhatsApp və zəng klikləri, həm maşın üzrə, həm də gün/həftə/ay üzrə.

## Placeholder-lər (real məlumat gələndə dəyişin)

| Nə | Harada |
|---|---|
| Loqo | `public/logo-placeholder.svg`, `src/components/layout/Logo.tsx` |
| Dəqiq ünvan + Google Maps pin | `src/config/site.ts` → `address`, `mapsLink`, `mapsEmbed` |
| İş saatları | `src/config/site.ts` → `hours` |
| Instagram | `src/config/site.ts` → `instagram` |
| Nihadın və komandanın şəkilləri | `src/pages/About.tsx` |

## Skriptlər

| Əmr | Nə edir |
|---|---|
| `npm run dev` | lokal server |
| `npm run build` | typecheck + production build |
| `npm run seed:sql` | `demoCars.ts`-dən `supabase/seed.sql` yaradır |
