/**
 * /masin/:slug üçün server tərəfində meta tag-lar.
 * WhatsApp, TikTok, Facebook link önizləmələri JavaScript işlətmir — ona görə
 * index.html-i götürüb başlıq/təsvir/şəkli maşına görə dəyişirik. SPA isə adi kimi yüklənir.
 */
export const config = { runtime: 'edge' };

interface CarRow {
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  engine_l: number | null;
  mileage_km: number | null;
  cover_thumb: string | null;
  car_images: { path: string; position: number }[];
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') ?? '';
  const origin = url.origin;

  const shell = await fetch(`${origin}/index.html`);
  let html = await shell.text();

  const sbUrl = process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.VITE_SUPABASE_ANON_KEY;
  const siteUrl = process.env.VITE_SITE_URL || origin;

  if (sbUrl && sbKey && /^[a-z0-9-]+$/.test(slug)) {
    try {
      const api =
        `${sbUrl}/rest/v1/cars?slug=eq.${slug}&limit=1` +
        `&select=brand,model,year,price,status,engine_l,mileage_km,cover_thumb,car_images(path,position)`;
      const res = await fetch(api, { headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` } });
      const [car] = (await res.json()) as CarRow[];
      if (car) {
        const name = `${car.brand} ${car.model}`;
        const sold = car.status === 'satildi';
        const title = sold
          ? `${name} ${car.year} — satıldı | Elim Yandı Auto`
          : `Bakıda satılıq ${name}, ${car.year} — ${num(car.price)} AZN | Elim Yandı Auto`;
        const bits = [car.engine_l ? `${Number(car.engine_l).toFixed(1)} L` : null, car.mileage_km != null ? `${num(car.mileage_km)} km` : null]
          .filter(Boolean)
          .join(', ');
        const desc = `${name} ${car.year}${bits ? `, ${bits}` : ''}. Qiymət: ${num(car.price)} AZN. Elim Yandı Auto — Bakı, Babək. ☎ 055 200 04 38`;
        const first = [...car.car_images].sort((a, b) => a.position - b.position)[0]?.path ?? car.cover_thumb;
        const image = first ? `${sbUrl}/storage/v1/object/public/car-images/${first}` : `${siteUrl}/og-default.png`;
        const canonical = `${siteUrl}/masin/${slug}`;

        const meta = [
          `<meta property="og:type" content="product" />`,
          `<meta property="og:site_name" content="Elim Yandı Auto" />`,
          `<meta property="og:title" content="${esc(title)}" />`,
          `<meta property="og:description" content="${esc(desc)}" />`,
          `<meta property="og:image" content="${esc(image)}" />`,
          `<meta property="og:url" content="${esc(canonical)}" />`,
          `<meta property="og:locale" content="az_AZ" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<link rel="canonical" href="${esc(canonical)}" />`,
        ].join('\n    ');

        html = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}" />`)
          .replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, meta);
      }
    } catch {
      /* Supabase əlçatmazdırsa adi index.html qaytar */
    }
  }

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
