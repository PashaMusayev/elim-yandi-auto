-- Açıq icazələr (GRANT). Bəzi yeni Supabase layihələrində yeni cədvəllərə
-- anon/authenticated rollarına avtomatik icazə verilmir. Bu fayl təkrar işə salına bilər.
-- Kimin nəyi görəcəyini yenə də RLS qaydaları (0001_init.sql) həll edir.

grant usage on schema public to anon, authenticated;

grant select on public.cars, public.car_images to anon, authenticated;
grant insert, update, delete on public.cars, public.car_images to authenticated;

grant insert on public.car_events to anon, authenticated;
grant select, delete on public.car_events to authenticated;

grant select on public.admins to authenticated;
grant select on public.car_stats to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
