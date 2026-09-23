import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Supabase qurulmayıbsa sayt demo (seed) məlumatları ilə işləyir. */
export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const IMAGE_BUCKET = 'car-images';

/** Storage path → ictimai URL. Tam URL və ya /yerli path gəlibsə olduğu kimi qaytarır. */
export function publicImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-car.svg';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  if (!supabase) return '/placeholder-car.svg';
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
