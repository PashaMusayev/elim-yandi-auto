import type { CarStatus } from '@/types/car';

export function StatusStamp({ status }: { status: CarStatus }) {
  if (status === 'satishda') return null;
  const sold = status === 'satildi';
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <span
        className={`-rotate-12 rounded-md border-4 px-4 py-1 font-display text-2xl font-black tracking-wider uppercase backdrop-blur-[2px] ${
          sold ? 'border-flame bg-black/55 text-flame' : 'border-ember bg-black/55 text-ember'
        }`}
      >
        {sold ? 'Satıldı' : 'Rezerv'}
      </span>
    </div>
  );
}

export function StatusPill({ status }: { status: CarStatus }) {
  const cls = {
    satishda: 'bg-ok/15 text-green-400 ring-green-500/30',
    rezerv: 'bg-ember/15 text-ember ring-ember/30',
    satildi: 'bg-flame/15 text-flame ring-flame/30',
  }[status];
  const label = { satishda: 'Satışda', rezerv: 'Rezerv', satildi: 'Satıldı' }[status];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${cls}`}>{label}</span>;
}
