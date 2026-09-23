import { supabase } from './supabase';

export type TrackEvent = 'view' | 'whatsapp' | 'call';

const VISITOR_KEY = 'eya_vid';

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

/** Eyni sessiyada eyni maşına təkrar baxışı saymırıq. */
function seenThisSession(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');
  } catch {
    /* private rejim — sadəcə say */
  }
  return false;
}

export function track(carId: string, type: TrackEvent): void {
  if (!supabase) return;
  if (type === 'view' && seenThisSession(`eya_v_${carId}`)) return;
  // Fire-and-forget: statistika səhifənin işinə mane olmamalıdır.
  void supabase.from('car_events').insert({ car_id: carId, type, visitor: visitorId() }).then(
    () => undefined,
    () => undefined,
  );
}
