import { formatNumber } from '@/lib/format';

interface Props {
  price: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  struck?: boolean;
}

const SIZES = {
  sm: { box: 'px-2.5 py-1 gap-1.5 text-base', check: 'size-4 text-[10px]', cur: 'text-[11px]' },
  md: { box: 'px-3 py-1.5 gap-2 text-xl', check: 'size-5 text-xs', cur: 'text-xs' },
  lg: { box: 'px-4 py-2 gap-2.5 text-3xl', check: 'size-7 text-base', cur: 'text-sm' },
};

/** Brendin TikTok videolarındakı qiymət "etiketi": ağ fon, qara mətn, yaşıl ✓. */
export function PriceTag({ price, size = 'md', className = '', struck = false }: Props) {
  const s = SIZES[size];
  return (
    <span
      className={`inline-flex items-center rounded-lg bg-white font-black text-black shadow-[0_4px_0_rgba(0,0,0,.35)] tabular-nums ${s.box} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-full bg-ok font-black text-white ${s.check}`}
      >
        ✓
      </span>
      <span className={struck ? 'line-through decoration-flame decoration-[3px]' : ''}>{formatNumber(price)}</span>
      <span className={`font-extrabold ${s.cur}`}>AZN</span>
    </span>
  );
}
