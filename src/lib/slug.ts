const MAP: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 'sh', ç: 'ch', ğ: 'g', İ: 'i' };

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[əıöüşçğİ]/g, (ch) => MAP[ch] ?? ch)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Mercedes", "E280", 2008 → "mercedes-e280-2008-x7k2" */
export function carSlug(brand: string, model: string, year: number): string {
  const rand = Math.random().toString(36).slice(2, 6);
  return `${slugify(`${brand} ${model} ${year}`)}-${rand}`;
}
