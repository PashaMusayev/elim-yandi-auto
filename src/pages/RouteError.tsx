import { isRouteErrorResponse, useRouteError } from 'react-router';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/errors';
import NotFound from './NotFound';

/** Route səviyyəsində xəta: texniki mətn əvəzinə səliqəli səhifə. */
export default function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  console.error(error);

  return (
    <div className="grid min-h-[70dvh] place-items-center p-6 text-center">
      <div className="max-w-sm">
        <p className="text-5xl">🔥😅</p>
        <h1 className="mt-4 text-2xl font-black">Nəsə yandı… amma maşın yox!</h1>
        <p className="mt-2 text-white/65">Səhifəni yeniləyin. Problem təkrarlansa, bizə WhatsApp-da yazın.</p>
        <Button onClick={() => location.reload()} className="mt-6">
          <RotateCw className="size-5" /> Səhifəni yenilə
        </Button>
        <p className="mt-6 text-xs break-words text-white/30">{errorMessage(error, '')}</p>
      </div>
    </div>
  );
}
