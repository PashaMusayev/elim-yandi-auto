import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

type Variant = 'fire' | 'wa' | 'ghost' | 'white';

const VARIANTS: Record<Variant, string> = {
  fire: 'bg-fire text-white shadow-[0_8px_24px_-8px_rgba(255,77,26,.7)] hover:brightness-110',
  wa: 'bg-wa text-black shadow-[0_8px_24px_-8px_rgba(37,211,102,.6)] hover:brightness-105',
  ghost: 'bg-white/5 text-white ring-1 ring-white/15 hover:bg-white/10',
  white: 'bg-white text-black hover:bg-white/90',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold transition active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none';

export const btn = (v: Variant = 'fire', extra = '') => `${base} ${VARIANTS[v]} ${extra}`;

export function Button({
  variant = 'fire',
  className = '',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={btn(variant, className)} />;
}

export function ButtonLink({
  to,
  variant = 'fire',
  className = '',
  children,
}: {
  to: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={btn(variant, className)}>
      {children}
    </Link>
  );
}

export function ButtonA({
  variant = 'fire',
  className = '',
  ...p
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a {...p} className={btn(variant, className)} />;
}
