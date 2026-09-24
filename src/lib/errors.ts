/** Supabase xətaları Error deyil, {message, code, hint} obyektidir — hər ikisini oxunaqlı mətnə çevirir. */
export function errorMessage(e: unknown, fallback = 'Xəta baş verdi'): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' && e.message) {
    const code = 'code' in e && e.code ? ` (${String(e.code)})` : '';
    return e.message + code;
  }
  return fallback;
}

export function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(errorMessage(e));
}
