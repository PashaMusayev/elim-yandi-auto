import { useSyncExternalStore } from 'react';

/**
 * Seçilmişlər (❤️) — brauzerdə yadda qalır, bütün komponentlər eyni vəziyyəti görür.
 * Çekməcənin açıq/bağlı olması da burada saxlanılır ki, başlıqdakı düymə açsın, Layout göstərsin.
 */
const KEY = 'eya_favorites';

interface State {
  ids: string[];
  drawerOpen: boolean;
}

function load(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let state: State = { ids: typeof window === 'undefined' ? [] : load(), drawerOpen: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  if (next.ids) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next.ids));
    } catch {
      /* private rejim — yalnız bu sessiyada qalır */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// Başqa tabda dəyişəndə sinxronla
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) set({ ids: load() });
  });
}

export const favorites = {
  toggle(id: string) {
    set({ ids: state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [id, ...state.ids] });
  },
  remove(id: string) {
    set({ ids: state.ids.filter((x) => x !== id) });
  },
  openDrawer() {
    set({ drawerOpen: true });
  },
  closeDrawer() {
    set({ drawerOpen: false });
  },
};

export function useFavorites() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
