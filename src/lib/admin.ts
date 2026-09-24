import type { Session } from '@supabase/supabase-js';
import type { Car, CarImage, CarStats, CarStatus, CarWithImages } from '@/types/car';
import { invalidateCars } from './cars';
import type { ProcessedImage } from './image';
import { IMAGE_BUCKET, supabase } from './supabase';

function sb() {
  if (!supabase) throw new Error('Supabase qoşulmayıb (.env faylına VITE_SUPABASE_URL və VITE_SUPABASE_ANON_KEY yazın)');
  return supabase;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  return (await sb().auth.getSession()).data.session;
}

export async function signIn(email: string, password: string) {
  const { error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-poçt və ya şifrə səhvdir' : error.message);
}

export async function signOut() {
  await sb().auth.signOut();
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await sb().rpc('is_admin');
  if (error) throw error;
  return data === true;
}

// ─── Maşınlar ────────────────────────────────────────────────────────────────

export type CarInput = Omit<Car, 'id' | 'cover_thumb' | 'sold_at' | 'created_at' | 'updated_at'>;

export async function adminFetchCars(): Promise<Car[]> {
  const { data, error } = await sb()
    .from('cars')
    .select('*')
    .order('status_rank')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Car[];
}

export async function adminFetchCar(id: string): Promise<CarWithImages> {
  const { data, error } = await sb()
    .from('cars')
    .select('*,car_images(*)')
    .eq('id', id)
    .order('position', { referencedTable: 'car_images' })
    .single();
  if (error) throw error;
  return data as CarWithImages;
}

export async function saveCar(input: CarInput, id?: string): Promise<Car> {
  const q = id ? sb().from('cars').update(input).eq('id', id) : sb().from('cars').insert(input);
  const { data, error } = await q.select('*').single();
  if (error) {
    if (error.code === '23505') throw new Error('Bu slug artıq var — başqa ad seçin');
    throw error;
  }
  invalidateCars();
  return data as Car;
}

export async function setCarStatus(id: string, status: CarStatus) {
  const { error } = await sb().from('cars').update({ status }).eq('id', id);
  if (error) throw error;
  invalidateCars();
}

export async function deleteCar(id: string) {
  const { data: imgs } = await sb().from('car_images').select('path,thumb').eq('car_id', id);
  const paths = storagePaths((imgs ?? []).flatMap((i) => [i.path, i.thumb]));
  if (paths.length) await sb().storage.from(IMAGE_BUCKET).remove(paths);
  const { error } = await sb().from('cars').delete().eq('id', id);
  if (error) throw error;
  invalidateCars();
}

// ─── Şəkillər ────────────────────────────────────────────────────────────────

/** Şəkilləri paralel yükləyir və car_images-ə yazır. Nəticə girişlə eyni sıradadır. */
export async function uploadCarImages(
  carId: string,
  images: { img: ProcessedImage; position: number }[],
  onProgress?: (done: number) => void,
): Promise<CarImage[]> {
  if (!images.length) return [];
  const bucket = sb().storage.from(IMAGE_BUCKET);
  let done = 0;
  const rows = await Promise.all(
    images.map(async ({ img, position }) => {
      const key = crypto.randomUUID();
      const path = `${carId}/${key}.webp`;
      const thumb = `${carId}/${key}_t.webp`;
      const opts = { contentType: 'image/webp', cacheControl: '31536000', upsert: false };
      const [a, b] = await Promise.all([bucket.upload(path, img.full, opts), bucket.upload(thumb, img.thumb, opts)]);
      if (a.error) throw a.error;
      if (b.error) throw b.error;
      onProgress?.(++done);
      return { car_id: carId, path, thumb, position };
    }),
  );
  const { data, error } = await sb().from('car_images').insert(rows).select('*');
  if (error) throw error;
  invalidateCars();
  const byPath = new Map((data as CarImage[]).map((r) => [r.path, r]));
  return rows.map((r) => byPath.get(r.path)!);
}

/** Xarici linklə şəkil: storage-a yüklənmir, link olduğu kimi saxlanılır. */
export async function addCarImageUrls(carId: string, images: { url: string; position: number }[]): Promise<CarImage[]> {
  if (!images.length) return [];
  const rows = images.map(({ url, position }) => ({ car_id: carId, path: url, thumb: url, position }));
  const { data, error } = await sb().from('car_images').insert(rows).select('*');
  if (error) throw error;
  invalidateCars();
  const byPos = new Map((data as CarImage[]).map((r) => [r.position, r]));
  return rows.map((r) => byPos.get(r.position)!);
}

/** Yalnız öz storage-ımızdakı faylları silirik; xarici linklərə toxunmuruq. */
const storagePaths = (paths: string[]) => paths.filter((p) => !/^https?:\/\//i.test(p));

export async function deleteCarImage(img: CarImage) {
  const paths = storagePaths([img.path, img.thumb]);
  if (paths.length) await sb().storage.from(IMAGE_BUCKET).remove(paths);
  const { error } = await sb().from('car_images').delete().eq('id', img.id);
  if (error) throw error;
  invalidateCars();
}

/** Sıralamanı yadda saxlayır (ilk şəkil = kartdakı əsas şəkil). */
export async function reorderCarImages(images: CarImage[]) {
  const results = await Promise.all(
    images.map((img, position) => sb().from('car_images').update({ position }).eq('id', img.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  invalidateCars();
}

// ─── Statistika ──────────────────────────────────────────────────────────────

export async function fetchStats(): Promise<CarStats[]> {
  const { data, error } = await sb().from('car_stats').select('*').order('views', { ascending: false });
  if (error) throw error;
  return data as CarStats[];
}

export async function fetchEventTotals(sinceDays: number) {
  const since = new Date(Date.now() - sinceDays * 864e5).toISOString();
  const count = async (type: string) => {
    const { count, error } = await sb()
      .from('car_events')
      .select('id', { count: 'exact', head: true })
      .eq('type', type)
      .gte('created_at', since);
    if (error) throw error;
    return count ?? 0;
  };
  const [views, whatsapp, calls] = await Promise.all([count('view'), count('whatsapp'), count('call')]);
  return { views, whatsapp, calls };
}
