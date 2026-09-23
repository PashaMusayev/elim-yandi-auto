import { BadgeCheck, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { SITE } from '@/config/site';

const POINTS = [
  { icon: ShieldCheck, title: 'Rəsmi sayt', text: 'Elim Yandı Auto-nun yeganə rəsmi saytı budur.' },
  { icon: MapPin, title: 'Yeganə ünvan — Babək', text: 'Başqa filialımız yoxdur. Bizim adımızla başqa yerdə satış edənlərə inanmayın!' },
  { icon: Wrench, title: 'Yoxlanılmış maşınlar', text: 'Hər maşına Nihad özü baxır — gizli qüsur yox, sürpriz yox.' },
  { icon: BadgeCheck, title: 'Real qiymət', text: 'Saytdakı qiymət — videodakı qiymətdir. Gəlib "o başqa idi" eşitməyəcəksən.' },
];

export function TrustBlock() {
  return (
    <section className="container-x">
      <div className="rounded-3xl border-2 border-dashed border-ember/40 bg-ember/[.04] p-6 sm:p-10">
        <p className="text-sm font-black tracking-widest text-ember uppercase">Diqqət! ⚠️</p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase sm:text-4xl">
          Rəsmi sayt — yeganə ünvan <span className="text-fire">Babək</span>
        </h2>
        <p className="mt-2 text-white/70">{SITE.addressNote}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-coal p-4">
              <Icon className="size-6 shrink-0 text-ember" />
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-white/65">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
