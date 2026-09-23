-- Elim Yandı Auto — əsas sxem
-- Supabase SQL Editor-da və ya `supabase db push` ilə işə salın.

-- ─── ENUM-lar ────────────────────────────────────────────────────────────────
create type public.car_status   as enum ('satishda', 'rezerv', 'satildi');
create type public.fuel_type    as enum ('benzin', 'dizel', 'hibrid', 'elektrik', 'qaz_benzin');
create type public.gearbox_type as enum ('avtomat', 'mexanika', 'robot', 'variator');
create type public.event_type   as enum ('view', 'whatsapp', 'call');

-- ─── Adminlər ────────────────────────────────────────────────────────────────
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─── Maşınlar ────────────────────────────────────────────────────────────────
create table public.cars (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  brand       text not null check (length(brand) between 1 and 40),
  model       text not null check (length(model) between 1 and 60),
  year        smallint not null check (year between 1970 and 2100),
  price       integer not null check (price > 0),
  engine_l    numeric(3, 1) check (engine_l is null or engine_l between 0.5 and 9.9),
  engine_hp   smallint check (engine_hp is null or engine_hp > 0),
  fuel        public.fuel_type not null,
  gearbox     public.gearbox_type not null,
  mileage_km  integer check (mileage_km is null or mileage_km >= 0),
  body_type   text,
  color       text,
  drive       text,
  description text,
  tiktok_url  text check (tiktok_url is null or tiktok_url ~* '^https://(www\.|vm\.|vt\.)?tiktok\.com/'),
  status      public.car_status not null default 'satishda',
  status_rank smallint not null default 0, -- sıralama üçün: satışda → rezerv → satıldı (trigger yazır)
  is_featured boolean not null default false,
  cover_thumb text,            -- ilk şəklin thumbnail-i (trigger ilə yenilənir)
  sold_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index cars_catalog_idx on public.cars (status_rank, created_at desc);
create index cars_brand_idx   on public.cars (brand);
create index cars_price_idx   on public.cars (price);
create index cars_year_idx    on public.cars (year);

-- updated_at + sold_at avtomatik
create or replace function public.cars_before_write()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.status_rank := case new.status when 'satishda' then 0 when 'rezerv' then 1 else 2 end;
  if new.status = 'satildi' and (tg_op = 'INSERT' or old.status is distinct from 'satildi') then
    new.sold_at := coalesce(new.sold_at, now());
  elsif new.status <> 'satildi' then
    new.sold_at := null;
  end if;
  return new;
end;
$$;

create trigger cars_before_write
before insert or update on public.cars
for each row execute function public.cars_before_write();

-- ─── Şəkillər ────────────────────────────────────────────────────────────────
create table public.car_images (
  id       uuid primary key default gen_random_uuid(),
  car_id   uuid not null references public.cars (id) on delete cascade,
  path     text not null,   -- car-images/{car_id}/{uuid}.webp
  thumb    text not null,   -- car-images/{car_id}/{uuid}_t.webp
  position smallint not null default 0
);
create index car_images_car_idx on public.car_images (car_id, position);

-- cars.cover_thumb həmişə ilk şəkli göstərsin
create or replace function public.sync_cover_thumb()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.car_id, old.car_id);
begin
  update public.cars c
     set cover_thumb = (
       select i.thumb from public.car_images i
        where i.car_id = target
        order by i.position, i.id
        limit 1)
   where c.id = target;
  return null;
end;
$$;

create trigger car_images_sync_cover
after insert or update or delete on public.car_images
for each row execute function public.sync_cover_thumb();

-- ─── Statistika hadisələri ───────────────────────────────────────────────────
create table public.car_events (
  id         bigint generated always as identity primary key,
  car_id     uuid not null references public.cars (id) on delete cascade,
  type       public.event_type not null,
  visitor    text check (visitor is null or length(visitor) <= 64),
  created_at timestamptz not null default now()
);
create index car_events_car_idx on public.car_events (car_id, type);
create index car_events_time_idx on public.car_events (created_at desc);

create view public.car_stats
with (security_invoker = true)
as
select
  c.id, c.brand, c.model, c.year, c.status,
  count(e.id) filter (where e.type = 'view')::int     as views,
  count(e.id) filter (where e.type = 'whatsapp')::int as whatsapp_clicks,
  count(e.id) filter (where e.type = 'call')::int     as call_clicks
from public.cars c
left join public.car_events e on e.car_id = c.id
group by c.id;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table public.admins     enable row level security;
alter table public.cars       enable row level security;
alter table public.car_images enable row level security;
alter table public.car_events enable row level security;

create policy "admins: öz qeydini oxu" on public.admins
  for select to authenticated using (user_id = auth.uid());

create policy "cars: hamı oxuya bilər" on public.cars
  for select using (true);
create policy "cars: admin yazır" on public.cars
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "car_images: hamı oxuya bilər" on public.car_images
  for select using (true);
create policy "car_images: admin yazır" on public.car_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "car_events: hamı əlavə edə bilər" on public.car_events
  for insert to anon, authenticated with check (true);
create policy "car_events: admin oxuyur" on public.car_events
  for select to authenticated using (public.is_admin());
create policy "car_events: admin silir" on public.car_events
  for delete to authenticated using (public.is_admin());

grant select on public.car_stats to authenticated;

-- ─── Storage ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-images', 'car-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "car-images: hamı oxuya bilər" on storage.objects
  for select using (bucket_id = 'car-images');
create policy "car-images: admin yükləyir" on storage.objects
  for insert to authenticated with check (bucket_id = 'car-images' and public.is_admin());
create policy "car-images: admin yeniləyir" on storage.objects
  for update to authenticated using (bucket_id = 'car-images' and public.is_admin());
create policy "car-images: admin silir" on storage.objects
  for delete to authenticated using (bucket_id = 'car-images' and public.is_admin());
