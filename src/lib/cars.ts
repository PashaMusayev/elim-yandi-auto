import { DEMO_CARS } from '@/data/demoCars';
import type { Car, CarWithImages } from '@/types/car';
import { supabase } from './supabase';

const LIST_COLUMNS =
  'id,slug,brand,model,year,price,engine_l,engine_hp,fuel,gearbox,mileage_km,body_type,color,drive,description,tiktok_url,status,is_featured,cover_thumb,sold_at,created_at,updated_at';

let listCache: { at: number; data: Car[] } | null = null;
const TTL = 60_000;

/** Bütün maşınlar (salonda onlarla maşın olur — filtrləmə brauzerdə, ani). */
export async function fetchCars(force = false): Promise<Car[]> {
  if (!force && listCache && Date.now() - listCache.at < TTL) return listCache.data;
  if (!supabase) return DEMO_CARS;
  const { data, error } = await supabase
    .from('cars')
    .select(LIST_COLUMNS)
    .order('status_rank', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  listCache = { at: Date.now(), data: data as Car[] };
  return listCache.data;
}

export function invalidateCars() {
  listCache = null;
}

export async function fetchCarBySlug(slug: string): Promise<CarWithImages | null> {
  if (!supabase) return DEMO_CARS.find((c) => c.slug === slug) ?? null;
  const { data, error } = await supabase
    .from('cars')
    .select(`${LIST_COLUMNS},car_images(id,car_id,path,thumb,position)`)
    .eq('slug', slug)
    .order('position', { referencedTable: 'car_images' })
    .maybeSingle();
  if (error) throw error;
  return data as CarWithImages | null;
}
