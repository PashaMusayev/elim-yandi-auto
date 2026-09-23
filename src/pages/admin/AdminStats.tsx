import { useState } from 'react';
import { Eye, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/ui/BrandIcons';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { StatusPill } from '@/components/ui/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { fetchEventTotals, fetchStats } from '@/lib/admin';
import { formatNumber } from '@/lib/format';

const RANGES = [
  { days: 1, label: 'Bu gün' },
  { days: 7, label: '7 gün' },
  { days: 30, label: '30 gün' },
];

export default function AdminStats() {
  const [days, setDays] = useState(7);
  const totals = useAsync(() => fetchEventTotals(days), [days]);
  const stats = useAsync(() => fetchStats(), []);
  const [sort, setSort] = useState<'views' | 'whatsapp_clicks'>('views');

  const rows = [...(stats.data ?? [])].sort((a, b) => b[sort] - a[sort]);
  const max = Math.max(1, ...rows.map((r) => r[sort]));

  const KPIS = [
    { icon: Eye, label: 'Baxış', value: totals.data?.views, cls: 'text-white' },
    { icon: WhatsAppIcon, label: 'WhatsApp', value: totals.data?.whatsapp, cls: 'text-wa' },
    { icon: Phone, label: 'Zəng', value: totals.data?.calls, cls: 'text-ember' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Statistika</h1>
        <div className="flex rounded-xl bg-white/5 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setDays(r.days)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${days === r.days ? 'bg-white text-black' : 'text-white/70'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {KPIS.map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="rounded-2xl bg-coal p-4 ring-1 ring-white/5">
            <Icon className={`size-5 ${cls}`} />
            <p className="mt-2 text-2xl font-black tabular-nums sm:text-3xl">
              {totals.loading ? '…' : formatNumber(value ?? 0)}
            </p>
            <p className="text-xs font-semibold text-white/55">{label}</p>
          </div>
        ))}
      </div>
      {totals.data && totals.data.views > 0 && (
        <p className="text-sm text-white/60">
          Konversiya: baxışların{' '}
          <b className="text-white">
            {(((totals.data.whatsapp + totals.data.calls) / totals.data.views) * 100).toFixed(1)}%
          </b>{' '}
          -i WhatsApp və ya zəngə çevrilib.
        </p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-black">Maşınlar üzrə (bütün vaxt)</h2>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg bg-white/5 px-2 py-1.5 text-sm font-semibold ring-1 ring-white/10"
          >
            <option value="views" className="text-black">
              Baxışa görə
            </option>
            <option value="whatsapp_clicks" className="text-black">
              WhatsApp-a görə
            </option>
          </select>
        </div>
        {stats.loading ? (
          <PageSpinner />
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl bg-coal p-3 ring-1 ring-white/5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold">
                    {r.brand} {r.model} <span className="text-white/50">{r.year}</span>
                  </p>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-fire" style={{ width: `${(r[sort] / max) * 100}%` }} />
                </div>
                <p className="mt-1.5 flex gap-4 text-xs text-white/60 tabular-nums">
                  <span>👁 {r.views} baxış</span>
                  <span>💬 {r.whatsapp_clicks} WhatsApp</span>
                  <span>📞 {r.call_clicks} zəng</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
