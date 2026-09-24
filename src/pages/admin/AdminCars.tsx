import { errorMessage } from '@/lib/errors';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { btn } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { useAsync } from '@/hooks/useAsync';
import { adminFetchCars, fetchStats, setCarStatus } from '@/lib/admin';
import { carTitle, formatPrice } from '@/lib/format';
import { publicImageUrl } from '@/lib/supabase';
import { STATUS_LABEL, type Car, type CarStatus } from '@/types/car';

const STATUSES: CarStatus[] = ['satishda', 'rezerv', 'satildi'];
const STATUS_CLS: Record<CarStatus, string> = {
  satishda: 'bg-ok text-white',
  rezerv: 'bg-ember text-black',
  satildi: 'bg-flame text-white',
};

export default function AdminCars() {
  const { data, loading, error, reload } = useAsync(() => Promise.all([adminFetchCars(), fetchStats()]), []);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<CarStatus | 'all'>('all');
  const [pending, setPending] = useState<string | null>(null);
  const [override, setOverride] = useState<Record<string, CarStatus>>({});

  const statsById = useMemo(() => new Map(data?.[1].map((s) => [s.id, s])), [data]);
  const cars = useMemo(() => {
    const list = (data?.[0] ?? []).map((c) => ({ ...c, status: override[c.id] ?? c.status }));
    const needle = q.trim().toLowerCase();
    return list.filter(
      (c) =>
        (filter === 'all' || c.status === filter) &&
        (!needle || `${c.brand} ${c.model} ${c.year}`.toLowerCase().includes(needle)),
    );
  }, [data, q, filter, override]);

  const changeStatus = async (car: Car, status: CarStatus) => {
    if (status === car.status) return;
    setPending(car.id);
    setOverride((o) => ({ ...o, [car.id]: status }));
    try {
      await setCarStatus(car.id, status);
    } catch (e) {
      setOverride((o) => ({ ...o, [car.id]: car.status }));
      alert(errorMessage(e, 'Status dəyişmədi'));
    } finally {
      setPending(null);
    }
  };

  if (loading) return <PageSpinner />;
  if (error)
    return (
      <div className="rounded-2xl bg-coal p-6 text-center">
        <p>{error.message}</p>
        <button type="button" onClick={reload} className="mt-3 font-bold text-ember">
          Yenidən cəhd et
        </button>
      </div>
    );

  const counts = STATUSES.map((s) => (data?.[0] ?? []).filter((c) => (override[c.id] ?? c.status) === s).length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Maşınlar</h1>
        <Link to="/admin/masin/yeni" className={btn('fire', 'hidden !py-2.5 md:inline-flex')}>
          <Plus className="size-5" /> Yeni maşın
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(['all', ...STATUSES] as const).map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${filter === s ? 'bg-white text-black' : 'bg-white/5'}`}
          >
            {s === 'all' ? `Hamısı ${data?.[0].length ?? 0}` : `${STATUS_LABEL[s]} ${counts[i - 1]}`}
          </button>
        ))}
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          placeholder="Axtar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl bg-white/5 py-3 pr-3 pl-9 text-base ring-1 ring-white/10 outline-none focus:ring-ember"
        />
      </label>

      {cars.length === 0 ? (
        <div className="rounded-2xl bg-coal p-8 text-center text-white/60">
          Maşın yoxdur.{' '}
          <Link to="/admin/masin/yeni" className="font-bold text-ember">
            İlkini əlavə et →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cars.map((c) => {
            const st = statsById.get(c.id);
            return (
              <li key={c.id} className="overflow-hidden rounded-2xl bg-coal ring-1 ring-white/5">
                <div className="flex gap-3 p-3">
                  <img
                    src={publicImageUrl(c.cover_thumb)}
                    alt=""
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">
                      {carTitle(c)} <span className="font-semibold text-white/50">{c.year}</span>
                    </p>
                    <p className="font-bold text-ember">{formatPrice(c.price)}</p>
                    <p className="mt-1 flex gap-3 text-xs text-white/55">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3.5" /> {st?.views ?? 0}
                      </span>
                      <span>💬 {st?.whatsapp_clicks ?? 0}</span>
                      <span>📞 {st?.call_clicks ?? 0}</span>
                    </p>
                  </div>
                  <Link
                    to={`/admin/masin/${c.id}`}
                    className="grid size-11 shrink-0 place-items-center self-center rounded-xl bg-white/5"
                    aria-label={`${carTitle(c)} redaktə et`}
                  >
                    <Pencil className="size-5" />
                  </Link>
                </div>
                {/* Bir toxunuşla status dəyişmə */}
                <div className="grid grid-cols-3 gap-px border-t border-white/5 bg-white/5" role="radiogroup" aria-label="Status">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={c.status === s}
                      disabled={pending === c.id}
                      onClick={() => changeStatus(c, s)}
                      className={`py-2.5 text-sm font-bold transition ${c.status === s ? STATUS_CLS[s] : 'bg-coal text-white/50'}`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
