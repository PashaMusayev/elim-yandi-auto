import { Link } from 'react-router';
import { Flame } from 'lucide-react';

/** Loqo placeholder-i: real loqo gələndə <img src="/logo.svg"> ilə əvəz edin. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Elim Yandı Auto — ana səhifə">
      <span className="grid size-9 place-items-center rounded-lg border border-dashed border-ember/60 bg-ember/10">
        <Flame className="size-5 text-ember animate-flicker" />
      </span>
      <span className="font-display text-[15px] leading-none font-black tracking-tight uppercase">
        Elim <span className="text-fire">Yandı</span>
        <span className="block text-[10px] font-bold tracking-[0.3em] text-mute">auto</span>
      </span>
    </Link>
  );
}
