import { errorMessage } from '@/lib/errors';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera, ClipboardPaste, Link2, Loader2, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/PageSpinner';
import {
  addCarImageUrls,
  adminFetchCar,
  deleteCar,
  deleteCarImage,
  reorderCarImages,
  saveCar,
  uploadCarImages,
  type CarInput,
} from '@/lib/admin';
import { processImage, type ProcessedImage } from '@/lib/image';
import { carSlug } from '@/lib/slug';
import { publicImageUrl } from '@/lib/supabase';
import {
  FUEL_LABEL,
  GEARBOX_LABEL,
  STATUS_LABEL,
  type CarImage,
  type CarStatus,
  type FuelType,
  type GearboxType,
} from '@/types/car';
import { adminInput } from './AdminLogin';

// ─── Şəkil elementləri ───────────────────────────────────────────────────────
type Item =
  | { key: string; kind: 'existing'; img: CarImage; preview: string }
  | { key: string; kind: 'new'; state: 'processing' | 'ready' | 'error'; processed?: ProcessedImage; preview?: string }
  | { key: string; kind: 'url'; url: string; preview: string };

/** Mətndən bütün http(s) linklərini çıxarır (bir neçə link yapışdırmaq olar). */
function extractUrls(text: string): string[] {
  return [...new Set(text.match(/https?:\/\/[^\s"'<>]+/gi) ?? [])];
}

const BRANDS = ['Mercedes-Benz', 'BMW', 'Toyota', 'Hyundai', 'Kia', 'Lexus', 'Opel', 'Chevrolet', 'Nissan', 'Volkswagen'];
const THIS_YEAR = new Date().getFullYear();
const LAST_KEY = 'eya_admin_last';

interface FormState {
  brand: string;
  model: string;
  year: string;
  price: string;
  engine_l: string;
  engine_hp: string;
  fuel: FuelType;
  gearbox: GearboxType;
  mileage_km: string;
  body_type: string;
  color: string;
  drive: string;
  description: string;
  tiktok_url: string;
  status: CarStatus;
  is_featured: boolean;
}

function defaults(): FormState {
  let last: Partial<FormState> = {};
  try {
    last = JSON.parse(localStorage.getItem(LAST_KEY) ?? '{}');
  } catch {
    /* boş */
  }
  return {
    brand: '',
    model: '',
    year: '',
    price: '',
    engine_l: '',
    engine_hp: '',
    fuel: last.fuel ?? 'benzin',
    gearbox: last.gearbox ?? 'avtomat',
    mileage_km: '',
    body_type: '',
    color: '',
    drive: '',
    description: '',
    tiktok_url: '',
    status: 'satishda',
    is_featured: false,
  };
}

const optNum = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));
const optStr = (s: string) => (s.trim() === '' ? null : s.trim());

// ─── UI köməkçiləri ──────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-white/70">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/40">{hint}</span>}
    </label>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Record<T, string>;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="space-y-1.5">
      <span className="text-sm font-bold text-white/70">{label}</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={value === k}
            onClick={() => onChange(k)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ring-1 transition ${
              value === k ? 'bg-fire ring-transparent' : 'bg-white/5 text-white/75 ring-white/10'
            }`}
          >
            {options[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Forma ───────────────────────────────────────────────────────────────────
export default function CarForm() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<FormState>(defaults);
  const [slug, setSlug] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [removed, setRemoved] = useState<CarImage[]>([]);
  const [urlText, setUrlText] = useState('');
  const [urlErr, setUrlErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!id) return;
    adminFetchCar(id)
      .then((c) => {
        setSlug(c.slug);
        setF({
          brand: c.brand,
          model: c.model,
          year: String(c.year),
          price: String(c.price),
          engine_l: c.engine_l?.toString() ?? '',
          engine_hp: c.engine_hp?.toString() ?? '',
          fuel: c.fuel,
          gearbox: c.gearbox,
          mileage_km: c.mileage_km?.toString() ?? '',
          body_type: c.body_type ?? '',
          color: c.color ?? '',
          drive: c.drive ?? '',
          description: c.description ?? '',
          tiktok_url: c.tiktok_url ?? '',
          status: c.status,
          is_featured: c.is_featured,
        });
        setItems(
          c.car_images.map((img) => ({ key: img.id, kind: 'existing', img, preview: publicImageUrl(img.thumb) })),
        );
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Səhifədən çıxanda blob URL-ləri təmizlə
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(
    () => () =>
      itemsRef.current.forEach((it) => it.kind === 'new' && it.preview && URL.revokeObjectURL(it.preview)),
    [],
  );

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const fresh = Array.from(files).map((file) => ({ file, key: crypto.randomUUID() }));
    setItems((prev) => [...prev, ...fresh.map(({ key }) => ({ key, kind: 'new' as const, state: 'processing' as const }))]);
    // Telefonda yaddaşı boğmamaq üçün 3-3 emal edirik
    const queue = [...fresh];
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const { file, key } = next;
        try {
          const processed = await processImage(file);
          setItems((prev) =>
            prev.map((it) => (it.key === key ? { key, kind: 'new', state: 'ready', processed, preview: processed.preview } : it)),
          );
        } catch {
          setItems((prev) => prev.map((it) => (it.key === key ? { key, kind: 'new', state: 'error' } : it)));
        }
      }
    };
    void Promise.all([worker(), worker(), worker()]);
  };

  const addUrls = (text: string) => {
    const urls = extractUrls(text);
    if (!urls.length) return setUrlErr('Link https:// ilə başlamalıdır');
    setUrlErr(null);
    setItems((prev) => {
      const have = new Set(prev.map((it) => (it.kind === 'url' ? it.url : it.kind === 'existing' ? it.img.path : '')));
      const fresh = urls.filter((u) => !have.has(u)).map((url) => ({ key: crypto.randomUUID(), kind: 'url' as const, url, preview: url }));
      return [...prev, ...fresh];
    });
    setUrlText('');
  };

  const pasteImageUrl = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t.trim()) addUrls(t);
    } catch {
      /* icazə verilmədi — əl ilə yapışdırsın */
    }
  };

  const removeItem = (key: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.key === key);
      if (it?.kind === 'existing') setRemoved((r) => [...r, it.img]);
      if (it?.kind === 'new' && it.preview) URL.revokeObjectURL(it.preview);
      return prev.filter((x) => x.key !== key);
    });
  };

  const makeCover = (key: string) =>
    setItems((prev) => {
      const it = prev.find((x) => x.key === key);
      return it ? [it, ...prev.filter((x) => x.key !== key)] : prev;
    });

  const pasteTikTok = async () => {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (t) set('tiktok_url', t);
    } catch {
      /* icazə verilmədi */
    }
  };

  const validate = (): string | null => {
    if (!f.brand.trim()) return 'Marka yazın';
    if (!f.model.trim()) return 'Model yazın';
    const y = Number(f.year);
    if (!Number.isInteger(y) || y < 1970 || y > THIS_YEAR + 1) return `İl 1970–${THIS_YEAR + 1} arası olmalıdır`;
    if (!(Number(f.price) > 0)) return 'Qiyməti yazın';
    if (f.tiktok_url && !/^https:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//i.test(f.tiktok_url.trim()))
      return 'TikTok linki https://www.tiktok.com/... və ya https://vm.tiktok.com/... olmalıdır';
    if (items.some((i) => i.kind === 'new' && i.state === 'processing')) return 'Şəkillər hələ hazırlanır, bir saniyə…';
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);
    setErr(null);

    const input: CarInput = {
      slug: slug ?? carSlug(f.brand, f.model, Number(f.year)),
      brand: f.brand.trim(),
      model: f.model.trim(),
      year: Number(f.year),
      price: Math.round(Number(f.price)),
      engine_l: optNum(f.engine_l),
      engine_hp: optNum(f.engine_hp),
      fuel: f.fuel,
      gearbox: f.gearbox,
      mileage_km: optNum(f.mileage_km),
      body_type: optStr(f.body_type),
      color: optStr(f.color),
      drive: optStr(f.drive),
      description: optStr(f.description),
      tiktok_url: optStr(f.tiktok_url),
      status: f.status,
      is_featured: f.is_featured,
    };

    try {
      setSaving('Yadda saxlanılır…');
      const car = await saveCar(input, id);
      try {
        localStorage.setItem(LAST_KEY, JSON.stringify({ fuel: f.fuel, gearbox: f.gearbox }));
      } catch {
        /* boş */
      }

      await Promise.all(removed.map(deleteCarImage));

      const pending = items
        .map((it, position) => ({ it, position }))
        .filter((x): x is { it: Extract<Item, { kind: 'new' }>; position: number } => x.it.kind === 'new' && x.it.state === 'ready');
      setSaving(`Şəkillər yüklənir 0/${pending.length}`);
      const uploaded = await uploadCarImages(
        car.id,
        pending.map(({ it, position }) => ({ img: it.processed!, position })),
        (n) => setSaving(`Şəkillər yüklənir ${n}/${pending.length}`),
      );

      const linked = await addCarImageUrls(
        car.id,
        items
          .map((it, position) => ({ it, position }))
          .filter((x): x is { it: Extract<Item, { kind: 'url' }>; position: number } => x.it.kind === 'url')
          .map(({ it, position }) => ({ url: it.url, position })),
      );

      // Yekun sıra: köhnə + yüklənən + link, ekrandakı ardıcıllıqla
      let u = 0;
      let l = 0;
      const final = items
        .filter((it) => it.kind !== 'new' || it.state === 'ready')
        .map((it) => (it.kind === 'existing' ? it.img : it.kind === 'url' ? linked[l++] : uploaded[u++]));
      if (!isNew) await reorderCarImages(final);

      nav('/admin', { replace: true });
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  const remove = async () => {
    if (!id || !confirm('Bu maşını tamamilə silmək istəyirsiniz? Satılıbsa, silmək əvəzinə "Satıldı" edin — sosial sübut kimi qalsın.')) return;
    setSaving('Silinir…');
    try {
      await deleteCar(id);
      nav('/admin', { replace: true });
    } catch (e) {
      setErr(errorMessage(e, 'Silinmədi'));
      setSaving(null);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6 pb-28">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="grid size-10 place-items-center rounded-xl bg-white/5" aria-label="Geri">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-black">{isNew ? 'Yeni maşın' : `${f.brand} ${f.model}`}</h1>
      </div>

      {/* 1. Şəkillər */}
      <section className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ember/50 bg-ember/5 py-6 text-lg font-black text-ember active:scale-[.99]"
        >
          <Camera className="size-7" /> Şəkil əlavə et
        </button>
        {/* Link ilə şəkil */}
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="url"
                inputMode="url"
                value={urlText}
                onChange={(e) => setUrlText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrls(urlText);
                  }
                }}
                onPaste={(e) => {
                  const t = e.clipboardData.getData('text');
                  if (extractUrls(t).length) {
                    e.preventDefault();
                    addUrls(t);
                  }
                }}
                placeholder="və ya şəklin linkini yapışdır"
                aria-label="Şəkil linki"
                className={`${adminInput} pl-9`}
              />
            </div>
            {urlText.trim() ? (
              <button type="button" onClick={() => addUrls(urlText)} className="shrink-0 rounded-xl bg-fire px-4 font-bold">
                Əlavə et
              </button>
            ) : (
              <button type="button" onClick={pasteImageUrl} className="grid w-14 shrink-0 place-items-center rounded-xl bg-white/10" aria-label="Linki yapışdır">
                <ClipboardPaste className="size-5" />
              </button>
            )}
          </div>
          {urlErr && <p className="text-sm font-semibold text-flame">{urlErr}</p>}
        </div>

        {items.length > 0 && (
          <>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {items.map((it, i) => (
                <li key={it.key} className="relative aspect-square overflow-hidden rounded-xl bg-coal">
                  {'preview' in it && it.preview ? (
                    <img
                      src={it.preview}
                      alt=""
                      className="size-full object-cover"
                      onError={(e) => {
                        if (it.kind === 'url') e.currentTarget.src = '/placeholder-car.svg';
                      }}
                    />
                  ) : it.kind === 'new' && it.state === 'error' ? (
                    <div className="grid size-full place-items-center p-2 text-center text-xs text-flame">Xəta</div>
                  ) : (
                    <div className="grid size-full place-items-center">
                      <Loader2 className="size-6 animate-spin text-ember" />
                    </div>
                  )}
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-fire px-1.5 py-0.5 text-[10px] font-black">ƏSAS</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeCover(it.key)}
                      className="absolute bottom-1 left-1 grid size-8 place-items-center rounded-lg bg-black/70"
                      aria-label="Əsas şəkil et"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  {it.kind === 'url' && (
                    <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold">LİNK</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(it.key)}
                    className="absolute top-1 right-1 grid size-8 place-items-center rounded-lg bg-black/70"
                    aria-label="Şəkli sil"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/45">⭐ — əsas şəkil et (kataloqda görünən). Yüklənən şəkillər avtomatik WebP-yə sıxılır; link ilə əlavə olunan şəkil isə həmin saytdan göstərilir.</p>
          </>
        )}
      </section>

      {/* 2. Əsas məlumat */}
      <section className="space-y-4 rounded-2xl bg-coal p-4 ring-1 ring-white/5">
        <Field label="Marka">
          <div className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
            {BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => set('brand', b)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${f.brand === b ? 'bg-white text-black' : 'bg-white/5'}`}
              >
                {b}
              </button>
            ))}
          </div>
          <input className={adminInput} value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Mercedes-Benz" required />
        </Field>
        <Field label="Model">
          <input className={adminInput} value={f.model} onChange={(e) => set('model', e.target.value)} placeholder="E280" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="İl">
            <input className={adminInput} inputMode="numeric" value={f.year} onChange={(e) => set('year', e.target.value.replace(/\D/g, ''))} placeholder="2008" maxLength={4} required />
          </Field>
          <Field label="Qiymət (AZN)">
            <input className={adminInput} inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} placeholder="18500" required />
          </Field>
          <Field label="Mühərrik (L)">
            <input className={adminInput} inputMode="decimal" value={f.engine_l} onChange={(e) => set('engine_l', e.target.value)} placeholder="3.0" />
          </Field>
          <Field label="Yürüş (km)">
            <input className={adminInput} inputMode="numeric" value={f.mileage_km} onChange={(e) => set('mileage_km', e.target.value.replace(/\D/g, ''))} placeholder="265000" />
          </Field>
        </div>
        <Segmented label="Yanacaq" value={f.fuel} onChange={(v) => set('fuel', v)} options={FUEL_LABEL} />
        <Segmented label="Sürətlər qutusu" value={f.gearbox} onChange={(v) => set('gearbox', v)} options={GEARBOX_LABEL} />
      </section>

      {/* 3. TikTok + status */}
      <section className="space-y-4 rounded-2xl bg-coal p-4 ring-1 ring-white/5">
        <Field label="TikTok linki" hint="Videonun linkini kopyala və 📋 düyməsinə bas">
          <div className="flex gap-2">
            <input className={adminInput} type="url" inputMode="url" value={f.tiktok_url} onChange={(e) => set('tiktok_url', e.target.value)} placeholder="https://www.tiktok.com/@elimyandi.auto/video/…" />
            <button type="button" onClick={pasteTikTok} className="grid w-14 shrink-0 place-items-center rounded-xl bg-white/10" aria-label="Linki yapışdır">
              <ClipboardPaste className="size-5" />
            </button>
          </div>
        </Field>
        <Segmented label="Status" value={f.status} onChange={(v) => set('status', v)} options={STATUS_LABEL} />
      </section>

      {/* 4. Əlavə (istəyə görə) */}
      <details className="group rounded-2xl bg-coal ring-1 ring-white/5">
        <summary className="cursor-pointer list-none p-4 font-bold">
          Əlavə məlumat <span className="font-normal text-white/50">(istəyə görə)</span>
          <span className="float-right transition group-open:rotate-180">▾</span>
        </summary>
        <div className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Güc (a.g.)">
              <input className={adminInput} inputMode="numeric" value={f.engine_hp} onChange={(e) => set('engine_hp', e.target.value.replace(/\D/g, ''))} placeholder="231" />
            </Field>
            <Field label="Rəng">
              <input className={adminInput} value={f.color} onChange={(e) => set('color', e.target.value)} placeholder="Gümüşü" />
            </Field>
            <Field label="Ban növü">
              <input className={adminInput} list="body-types" value={f.body_type} onChange={(e) => set('body_type', e.target.value)} placeholder="Sedan" />
            </Field>
            <Field label="Ötürücü">
              <select className={adminInput} value={f.drive} onChange={(e) => set('drive', e.target.value)}>
                <option value="">—</option>
                <option>Ön</option>
                <option>Arxa</option>
                <option>Tam</option>
              </select>
            </Field>
          </div>
          <datalist id="body-types">
            {['Sedan', 'Hetçbek', 'Universal', 'Krossover', 'Yolsuzluq', 'Kupe', 'Miniven', 'Pikap'].map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <Field label="Təsvir (Nihad nə deyir?)">
            <textarea className={`${adminInput} min-h-28`} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Motor saat kimi işləyir, salon təmizdir… 🔥" />
          </Field>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
            <span className="font-semibold">Ana səhifədə önə çıxar</span>
            <input type="checkbox" className="size-5 accent-[#ff4d1a]" checked={f.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
          </label>
        </div>
      </details>

      {!isNew && (
        <button type="button" onClick={remove} className="flex items-center gap-2 text-sm font-bold text-flame">
          <Trash2 className="size-4" /> Maşını sil
        </button>
      )}

      {/* Sabit "Yadda saxla" */}
      <div className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto max-w-2xl space-y-2 p-3">
          {err && <p className="rounded-lg bg-flame/15 px-3 py-2 text-sm font-semibold text-flame">{err}</p>}
          <Button type="submit" disabled={!!saving} className="w-full text-lg">
            {saving ? (
              <>
                <Loader2 className="size-5 animate-spin" /> {saving}
              </>
            ) : isNew ? (
              'Əlavə et 🔥'
            ) : (
              'Yadda saxla'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
