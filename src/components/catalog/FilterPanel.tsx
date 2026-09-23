import type { ReactNode } from 'react';
import type { Filters } from '@/lib/filters';
import { FUEL_LABEL, GEARBOX_LABEL, type FuelType, type GearboxType } from '@/types/car';

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
  brands: string[];
  years: number[];
}

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: '10K-a qədər', max: 10000 },
  { label: '10–20K', min: 10000, max: 20000 },
  { label: '20–40K', min: 20000, max: 40000 },
  { label: '40K+', min: 40000 },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
        active ? 'bg-fire text-white ring-transparent' : 'bg-white/5 text-white/80 ring-white/10 hover:ring-white/30'
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2.5 text-xs font-black tracking-widest text-white/50 uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

const input =
  'w-full rounded-xl bg-white/5 px-3 py-2.5 text-base font-semibold ring-1 ring-white/10 outline-none placeholder:text-white/30 focus:ring-ember';

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function FilterPanel({ value: f, onChange, brands, years }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const numOrUndef = (s: string) => (s === '' ? undefined : Math.max(0, Number(s)));

  return (
    <div className="space-y-7">
      <Group title="Qiymət (AZN)">
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <Chip
              key={p.label}
              active={f.minPrice === p.min && f.maxPrice === p.max}
              onClick={() =>
                f.minPrice === p.min && f.maxPrice === p.max
                  ? set({ minPrice: undefined, maxPrice: undefined })
                  : set({ minPrice: p.min, maxPrice: p.max })
              }
            >
              {p.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            type="number"
            placeholder="Min"
            aria-label="Minimum qiymət"
            className={input}
            value={f.minPrice ?? ''}
            onChange={(e) => set({ minPrice: numOrUndef(e.target.value) })}
          />
          <span className="text-white/40">—</span>
          <input
            inputMode="numeric"
            type="number"
            placeholder="Max"
            aria-label="Maksimum qiymət"
            className={input}
            value={f.maxPrice ?? ''}
            onChange={(e) => set({ maxPrice: numOrUndef(e.target.value) })}
          />
        </div>
      </Group>

      {brands.length > 0 && (
        <Group title="Marka">
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <Chip key={b} active={f.brands.includes(b)} onClick={() => set({ brands: toggle(f.brands, b) })}>
                {b}
              </Chip>
            ))}
          </div>
        </Group>
      )}

      <Group title="Buraxılış ili">
        <div className="flex items-center gap-2">
          <select
            aria-label="İl, başlanğıc"
            className={input}
            value={f.minYear ?? ''}
            onChange={(e) => set({ minYear: numOrUndef(e.target.value) })}
          >
            <option value="">-dən</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="text-white/40">—</span>
          <select
            aria-label="İl, son"
            className={input}
            value={f.maxYear ?? ''}
            onChange={(e) => set({ maxYear: numOrUndef(e.target.value) })}
          >
            <option value="">-dək</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Group>

      <Group title="Yanacaq">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FUEL_LABEL) as FuelType[]).map((k) => (
            <Chip key={k} active={f.fuels.includes(k)} onClick={() => set({ fuels: toggle(f.fuels, k) })}>
              {FUEL_LABEL[k]}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Sürətlər qutusu">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(GEARBOX_LABEL) as GearboxType[]).map((k) => (
            <Chip key={k} active={f.gearboxes.includes(k)} onClick={() => set({ gearboxes: toggle(f.gearboxes, k) })}>
              {GEARBOX_LABEL[k]}
            </Chip>
          ))}
        </div>
      </Group>

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
        <span className="font-semibold">Satılanları gizlət</span>
        <input
          type="checkbox"
          className="size-5 accent-[#ff4d1a]"
          checked={f.hideSold}
          onChange={(e) => set({ hideSold: e.target.checked })}
        />
      </label>
    </div>
  );
}
