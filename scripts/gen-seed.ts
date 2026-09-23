// supabase/seed.sql faylını src/data/demoCars.ts-dən yaradır: `npm run seed:sql`
import { writeFileSync } from 'node:fs';
import { DEMO_CARS_RAW } from '../src/data/demoCars.ts';

const q = (v: unknown) =>
  v === null || v === undefined ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;

const rows = DEMO_CARS_RAW.map((c) =>
  `  (${[c.slug, c.brand, c.model, c.year, c.price, c.engine_l, c.engine_hp].map(q).join(', ')}, ` +
  `${q(c.fuel)}, ${q(c.gearbox)}, ${[c.mileage_km, c.body_type, c.color, c.drive, c.description, c.tiktok_url].map(q).join(', ')}, ` +
  `${q(c.status)}, ${q(c.is_featured)}, now() - interval '${c.daysAgo} days')`,
);

const sql = `-- Avtomatik yaradılıb: scripts/gen-seed.ts. Əl ilə redaktə etməyin.
insert into public.cars
  (slug, brand, model, year, price, engine_l, engine_hp, fuel, gearbox, mileage_km,
   body_type, color, drive, description, tiktok_url, status, is_featured, created_at)
values
${rows.join(',\n')}
on conflict (slug) do nothing;
`;
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log(`seed.sql: ${rows.length} maşın`);
