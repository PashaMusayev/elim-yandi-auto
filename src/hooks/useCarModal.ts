import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/** Elan modalı URL-də `?elan=<slug>` kimi saxlanılır: telefonun "geri" düyməsi modalı bağlayır. */
export const MODAL_PARAM = 'elan';

export function useCarModal() {
  const [params, setParams] = useSearchParams();
  const slug = params.get(MODAL_PARAM);

  const open = useCallback(
    (next: string) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.set(MODAL_PARAM, next);
          return n;
        },
        { preventScrollReset: true },
      ),
    [setParams],
  );

  const close = useCallback(() => {
    // Modal saytın içindən açılıbsa, "geri" ilə bağla ki, tarixçə təmiz qalsın
    if ((window.history.state as { idx?: number } | null)?.idx) {
      window.history.back();
      return;
    }
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        n.delete(MODAL_PARAM);
        return n;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setParams]);

  return { slug, open, close };
}
