import type { ReactNode } from 'react';

export function SectionTitle({ kicker, children, action }: { kicker?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="text-xs font-black tracking-widest text-ember uppercase">{kicker}</p>}
        <h2 className="font-display text-2xl font-black uppercase sm:text-3xl">{children}</h2>
      </div>
      {action}
    </div>
  );
}
