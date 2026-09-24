import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowUpDown, Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  SORT_LABEL,
  type Filters,
  type SortKey,
} from '@/lib/filters';
import { lockScroll } from '@/lib/scrollLock';
import { FUEL_LABEL, GEARBOX_LABEL, type Car, type FuelType, type GearboxType } from '@/types/car';

interface Option {
  value: string;
  label: string;
}

const fieldLabel = 'mb-1.5 block text-xs font-black tracking-wider text-white/50 uppercase select-none';
const fieldBox =
  'flex min-h-12 w-full items-center justify-between gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-left ring-1 transition';

/** Popover-u yuxarı və ya aşağı açmaq: aşağıda yer azdırsa, yuxarı. */
function useDropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const bounds = ref.current.closest('[data-filter-scroll]')?.getBoundingClientRect();
      const bottom = bounds ? bounds.bottom : window.innerHeight;
      const top = bounds ? bounds.top : 0;
      setUp(bottom - rect.bottom < 320 && rect.top - top > bottom - rect.bottom);
    }
    setOpen((o) => !o);
  };
  return { ref, open, setOpen, up, toggle };
}

function Popover({ up, children }: { up: boolean; children: ReactNode }) {
  return (
    <div
      className={`absolute left-0 z-50 flex w-full max-w-[300px] flex-col overflow-hidden rounded-xl bg-smoke shadow-2xl ring-1 ring-white/15 ${
        up ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
      }`}
    >
      {children}
    </div>
  );
}

function ClearX({ onClick }: { onClick: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onClick())}
      className="grid size-5 place-items-center rounded-full text-white/40 hover:text-flame"
      aria-label="Təmizlə"
    >
      <X className="size-3.5" />
    </span>
  );
}

/** Kosalar üslubunda çoxseçimli açılan siyahı: yuxarıda "✕ Sıfırla", aşağıda "Təsdiqlə". */
function MultiSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const dd = useDropdown();
  const text =
    value.length === 0
      ? placeholder
      : value
          .slice(0, 2)
          .map((v) => options.find((o) => o.value === v)?.label ?? v)
          .join(', ') + (value.length > 2 ? ` (+${value.length - 2})` : '');

  return (
    <div ref={dd.ref} className={`relative ${dd.open ? 'z-30' : ''}`}>
      <span className={fieldLabel}>{label}</span>
      <button
        type="button"
        onClick={dd.toggle}
        aria-expanded={dd.open}
        className={`${fieldBox} ${dd.open ? 'ring-2 ring-ember' : value.length ? 'ring-white/25' : 'ring-white/10'}`}
      >
        <span className={`line-clamp-2 text-sm ${value.length ? 'font-bold' : 'text-white/40'}`}>{text}</span>
        <span className="flex shrink-0 items-center gap-0.5">
          {value.length > 0 && <ClearX onClick={() => onChange([])} />}
          <ChevronDown className={`size-4 text-white/40 transition ${dd.open ? 'rotate-180 text-ember' : ''}`} />
        </span>
      </button>
      {dd.open && (
        <Popover up={dd.up}>
          <div className="border-b border-white/10 px-3 py-1.5">
            <button
              type="button"
              onClick={() => {
                onChange([]);
                dd.setOpen(false);
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-flame hover:bg-flame/10"
            >
              <X className="size-3.5" /> Sıfırla
            </button>
          </div>
          <div className="max-h-[260px] space-y-0.5 overflow-y-auto overscroll-contain p-1.5">
            {options.length === 0 && <p className="px-3 py-2 text-sm text-white/40">Seçim yoxdur</p>}
            {options.map((o) => {
              const on = value.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                    on ? 'bg-ember/10 font-bold text-ember' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  <span
                    className={`ml-2 grid size-[18px] shrink-0 place-items-center rounded-md ring-1 ${
                      on ? 'bg-fire text-white ring-transparent' : 'ring-white/25'
                    }`}
                  >
                    {on && <Check className="size-3 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-white/10 p-2">
            <button
              type="button"
              onClick={() => dd.setOpen(false)}
              className="w-full rounded-lg bg-white py-2 text-xs font-black text-black hover:bg-white/90"
            >
              Təsdiqlə
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
}

/** İl üçün tək seçimli açılan siyahı. */
function YearSelect({
  placeholder,
  value,
  years,
  onChange,
}: {
  placeholder: string;
  value?: number;
  years: number[];
  onChange: (v?: number) => void;
}) {
  const dd = useDropdown();
  return (
    <div ref={dd.ref} className={`relative ${dd.open ? 'z-30' : ''}`}>
      <button
        type="button"
        onClick={dd.toggle}
        aria-expanded={dd.open}
        aria-label={placeholder}
        className={`${fieldBox} ${dd.open ? 'ring-2 ring-ember' : value ? 'ring-white/25' : 'ring-white/10'}`}
      >
        <span className={`text-sm ${value ? 'font-bold' : 'text-white/40'}`}>{value ?? placeholder}</span>
        <span className="flex shrink-0 items-center gap-0.5">
          {value !== undefined && <ClearX onClick={() => onChange(undefined)} />}
          <ChevronDown className={`size-4 text-white/40 transition ${dd.open ? 'rotate-180 text-ember' : ''}`} />
        </span>
      </button>
      {dd.open && (
        <Popover up={dd.up}>
          <div className="border-b border-white/10 px-3 py-1.5">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                dd.setOpen(false);
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-flame hover:bg-flame/10"
            >
              <X className="size-3.5" /> Sıfırla
            </button>
          </div>
          <div className="max-h-[230px] overflow-y-auto overscroll-contain p-1.5">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  onChange(y);
                  dd.setOpen(false);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm tabular-nums ${
                  y === value ? 'bg-ember/10 font-bold text-ember' : 'hover:bg-white/5'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}

function NumInput({ placeholder, value, step, onChange }: { placeholder: string; value?: number; step: number; onChange: (v?: number) => void }) {
  return (
    <div className="relative flex items-center">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={step}
        placeholder={placeholder}
        aria-label={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)))}
        className="h-12 w-full rounded-xl bg-white/5 px-3 pr-8 text-sm font-bold ring-1 ring-white/10 outline-none placeholder:font-normal placeholder:text-white/40 focus:ring-2 focus:ring-ember"
      />
      {value !== undefined && (
        <span className="absolute right-2">
          <ClearX onClick={() => onChange(undefined)} />
        </span>
      )}
    </div>
  );
}

function FilterFields({
  draft,
  set,
  brands,
  bodyTypes,
  years,
}: {
  draft: Filters;
  set: (patch: Partial<Filters>) => void;
  brands: string[];
  bodyTypes: string[];
  years: number[];
}) {
  const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <MultiSelect label="Marka" placeholder="Bütün markalar" options={opts(brands)} value={draft.brands} onChange={(v) => set({ brands: v })} />
        <MultiSelect label="Ban növü" placeholder="Bütün ban növləri" options={opts(bodyTypes)} value={draft.bodyTypes} onChange={(v) => set({ bodyTypes: v })} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <MultiSelect
          label="Yanacaq növü"
          placeholder="Bütün yanacaq növləri"
          options={(Object.keys(FUEL_LABEL) as FuelType[]).map((k) => ({ value: k, label: FUEL_LABEL[k] }))}
          value={draft.fuels}
          onChange={(v) => set({ fuels: v as FuelType[] })}
        />
        <MultiSelect
          label="Sürətlər qutusu"
          placeholder="Bütün sürətlər qutuları"
          options={(Object.keys(GEARBOX_LABEL) as GearboxType[]).map((k) => ({ value: k, label: GEARBOX_LABEL[k] }))}
          value={draft.gearboxes}
          onChange={(v) => set({ gearboxes: v as GearboxType[] })}
        />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <span className={fieldLabel}>Buraxılış ili</span>
          <div className="grid grid-cols-2 gap-2.5">
            <YearSelect placeholder="il, min." value={draft.minYear} years={years} onChange={(v) => set({ minYear: v })} />
            <YearSelect placeholder="il, maks." value={draft.maxYear} years={years} onChange={(v) => set({ maxYear: v })} />
          </div>
        </div>
        <div>
          <span className={fieldLabel}>Yürüş, km</span>
          <div className="grid grid-cols-2 gap-2.5">
            <NumInput placeholder="min." step={5000} value={draft.minKm} onChange={(v) => set({ minKm: v })} />
            <NumInput placeholder="maks." step={5000} value={draft.maxKm} onChange={(v) => set({ maxKm: v })} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <span className={fieldLabel}>Qiymət, AZN</span>
          <div className="grid grid-cols-2 gap-2.5">
            <NumInput placeholder="min." step={500} value={draft.minPrice} onChange={(v) => set({ minPrice: v })} />
            <NumInput placeholder="maks." step={500} value={draft.maxPrice} onChange={(v) => set({ maxPrice: v })} />
          </div>
        </div>
        <label className="flex h-12 cursor-pointer items-center justify-between gap-3 self-end rounded-xl bg-white/5 px-4 ring-1 ring-white/10">
          <span className="text-sm font-semibold">Satılanları gizlət</span>
          <input type="checkbox" className="size-5 accent-[#ff4d1a]" checked={draft.hideSold} onChange={(e) => set({ hideSold: e.target.checked })} />
        </label>
      </div>
    </div>
  );
}

/** Aktiv filtr etiketləri: "Marka: BMW ×" … "Hamısını sıfırla". */
function ActiveChips({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const chips: { label: string; clear: Partial<Filters> }[] = [];
  const range = (name: string, min?: number, max?: number, unit = '') =>
    min !== undefined && max !== undefined
      ? `${name}: ${formatNumber(min)}–${formatNumber(max)}${unit}`
      : min !== undefined
        ? `${name} ≥ ${formatNumber(min)}${unit}`
        : `${name} ≤ ${formatNumber(max!)}${unit}`;

  if (filters.brands.length) chips.push({ label: `Marka: ${filters.brands.join(', ')}`, clear: { brands: [] } });
  if (filters.bodyTypes.length) chips.push({ label: `Ban: ${filters.bodyTypes.join(', ')}`, clear: { bodyTypes: [] } });
  if (filters.fuels.length) chips.push({ label: `Yanacaq: ${filters.fuels.map((f) => FUEL_LABEL[f]).join(', ')}`, clear: { fuels: [] } });
  if (filters.gearboxes.length)
    chips.push({ label: `Qutu: ${filters.gearboxes.map((g) => GEARBOX_LABEL[g]).join(', ')}`, clear: { gearboxes: [] } });
  if (filters.minYear !== undefined || filters.maxYear !== undefined)
    chips.push({
      label: range('İl', filters.minYear, filters.maxYear).replace(/\./g, ''),
      clear: { minYear: undefined, maxYear: undefined },
    });
  if (filters.minKm !== undefined || filters.maxKm !== undefined)
    chips.push({ label: range('Yürüş', filters.minKm, filters.maxKm, ' km'), clear: { minKm: undefined, maxKm: undefined } });
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
    chips.push({ label: range('Qiymət', filters.minPrice, filters.maxPrice, ' ₼'), clear: { minPrice: undefined, maxPrice: undefined } });
  if (filters.hideSold) chips.push({ label: 'Satılanlar gizli', clear: { hideSold: false } });

  if (!chips.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold text-white/40">Aktiv:</span>
      {chips.map((c) => (
        <span key={c.label} className="inline-flex items-center gap-1 rounded-lg bg-ember/10 px-2 py-0.5 text-[11px] font-semibold text-ember ring-1 ring-ember/25">
          {c.label}
          <button type="button" onClick={() => onChange({ ...filters, ...c.clear })} className="ml-0.5 font-bold hover:text-white" aria-label={`${c.label} — sil`}>
            ×
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}
        className="ml-1 text-[11px] font-bold text-flame hover:underline"
      >
        Hamısını sıfırla
      </button>
    </div>
  );
}

interface Props {
  cars: Car[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

/** Kosalar üslubunda filtr paneli: kompüterdə düymənin altında açılır, mobildə tam ekran. */
export function FilterBar({ cars, filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = activeFilterCount(filters);

  const brands = useMemo(() => [...new Set(cars.map((c) => c.brand))].sort(), [cars]);
  const bodyTypes = useMemo(() => [...new Set(cars.map((c) => c.body_type).filter((b): b is string => !!b))].sort(), [cars]);
  const years = useMemo(() => {
    const ys = cars.map((c) => c.year);
    if (!ys.length) return [];
    const hi = Math.max(...ys);
    const lo = Math.min(...ys);
    return Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
  }, [cars]);
  const preview = useMemo(() => applyFilters(cars, draft).length, [cars, draft]);

  const openPanel = () => {
    setDraft(filters);
    setOpen(true);
  };
  const close = () => setOpen(false);
  const apply = () => {
    onChange(draft);
    setOpen(false);
  };
  const reset = () => setDraft({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort });
  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));

  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const unlock = mobile ? lockScroll() : undefined;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlock?.();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const fields = <FilterFields draft={draft} set={set} brands={brands} bodyTypes={bodyTypes} years={years} />;

  return (
    <div className={`relative ${open ? 'z-40' : 'z-10'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => (open ? close() : openPanel())}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-95 sm:px-6 ${
              count ? 'bg-fire text-white' : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            <SlidersHorizontal className="size-4" />
            Filtrlər
            {count > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-flame">{count}</span>}
          </button>

          {/* Kompüter: düymənin altında açılan panel */}
          {open && (
            <>
              <div className="fixed inset-0 z-40 hidden bg-black/40 md:block" onClick={close} aria-hidden="true" />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Filtrlər paneli"
                className="absolute top-full left-0 z-50 mt-2 hidden w-[560px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl bg-coal shadow-2xl ring-1 ring-white/15 md:flex"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-black">
                    <SlidersHorizontal className="size-4 text-ember" /> Filtrlər
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={reset} className="rounded-lg px-2 py-1 text-xs font-bold text-ember hover:bg-ember/10">
                      Sıfırla
                    </button>
                    <button type="button" onClick={close} className="grid size-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white" aria-label="Filtrləri bağla">
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                <div data-filter-scroll className="max-h-[min(600px,calc(100vh-200px))] overflow-y-auto overscroll-contain p-5">
                  {fields}
                </div>
                <div className="flex gap-2 border-t border-white/10 p-3">
                  <button type="button" onClick={apply} className="flex-1 rounded-xl bg-fire py-3 text-sm font-bold">
                    Nəticələri göstər ({preview} elan)
                  </button>
                  <button type="button" onClick={reset} className="rounded-xl px-4 text-xs font-bold text-white/60 ring-1 ring-white/15 hover:bg-white/5">
                    Sıfırla
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <label className="relative flex items-center">
          <span className="sr-only">Sırala</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ ...filters, sort: e.target.value as SortKey })}
            className="appearance-none rounded-xl bg-white/5 py-3 pr-9 pl-3.5 text-sm font-semibold ring-1 ring-white/10 outline-none focus:ring-ember"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k} className="bg-coal">
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-3 size-4 text-white/40" />
        </label>
      </div>

      <ActiveChips filters={filters} onChange={onChange} />

      {/* Mobil: tam ekran filtr (turbo.az üslubu) */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col bg-ink md:hidden" role="dialog" aria-modal="true" aria-label="Filtrlər">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3">
              <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Geri">
                <ArrowLeft className="size-6" />
              </button>
              <h2 className="text-base font-black">Filtrlər</h2>
              <button type="button" onClick={reset} className="rounded-lg px-2.5 py-1.5 text-sm font-extrabold text-ember">
                Sıfırla
              </button>
            </div>
            <div data-filter-scroll className="flex-1 overflow-y-auto overscroll-contain p-4">
              {fields}
            </div>
            <div className="pb-safe border-t border-white/10 p-4">
              <button type="button" onClick={apply} className="w-full rounded-2xl bg-fire py-4 text-base font-black">
                Axtar ({preview} elan)
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
