import { Flame } from 'lucide-react';

export function PageSpinner() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Yüklənir">
      <Flame className="size-10 animate-flicker text-ember" />
    </div>
  );
}
