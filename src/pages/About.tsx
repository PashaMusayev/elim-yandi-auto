import { Flame, HeartHandshake, Search, Wrench } from 'lucide-react';
import { SITE } from '@/config/site';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '@/components/ui/BrandIcons';
import { btn, ButtonLink } from '@/components/ui/Button';
import { useSeo } from '@/hooks/useSeo';
import { generalWhatsAppText, waLink } from '@/lib/whatsapp';

const TEAM = [
  { name: SITE.owner, role: 'Sahibkar, brendin sifəti, "əli yanan" adam 🔥' },
  { name: 'Komanda üzvü', role: 'Satış məsləhətçisi (ad və şəkil gələcək)' },
  { name: 'Komanda üzvü', role: 'Usta / texniki yoxlama (ad və şəkil gələcək)' },
];

const VALUES = [
  { icon: Search, title: 'Seçib gətiririk', text: 'Hər maşını bazarda uzun-uzun axtarırıq — qiyməti yandırmaq üçün.' },
  { icon: Wrench, title: 'Yoxlayırıq', text: 'Motor, qutu, kuzov — gizli qüsuru sənə satmırıq.' },
  { icon: HeartHandshake, title: 'Səmimi danışırıq', text: 'Nə görürsən, o var. Videoda deyilən qiymət — son qiymətdir.' },
];

export default function About() {
  useSeo({
    title: 'Haqqımızda — Nihad və Elim Yandı Auto komandası',
    description: `Elim Yandı Auto — ${SITE.tiktok.followers} TikTok izləyicili Nihadın avtosalonu. Bakı, Babək. Səmimi, açıq və sərfəli.`,
  });

  return (
    <div className="container-x space-y-14 py-8 sm:py-14">
      <header className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border-2 border-dashed border-ember/40 bg-coal">
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <Flame className="mx-auto size-16 animate-flicker text-ember" />
              <p className="mt-2 text-sm font-bold text-mute">Nihadın şəkli burada olacaq</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-black tracking-widest text-ember uppercase">Tanış olaq 👋</p>
          <h1 className="mt-2 font-display text-4xl leading-tight font-black uppercase sm:text-5xl">
            Salam, mən <span className="text-fire">{SITE.owner}</span>!
          </h1>
          <div className="mt-5 space-y-4 text-lg text-white/80">
            <p>
              TikTok-da məni yəqin görmüsən: maşını göstərirəm, qiyməti deyirəm, sonra da "əlim yandı!" deyirəm. Niyə?
              Çünki qiymətləri həqiqətən yandırırıq 😄
            </p>
            <p>
              Elim Yandı Auto — Babəkdə yerləşən kiçik, amma səmimi salondur. Başqa filialımız yoxdur, adımızdan istifadə
              edən başqa satıcılara inanmayın.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.tiktok.url} target="_blank" rel="noopener" className={btn('white')}>
              <TikTokIcon className="size-5" /> {SITE.tiktok.handle} · {SITE.tiktok.followers}
            </a>
            <a href={waLink(generalWhatsAppText)} target="_blank" rel="noopener" className={btn('wa')}>
              <WhatsAppIcon className="size-5" /> WhatsApp
            </a>
            {SITE.instagram && (
              <a href={SITE.instagram} target="_blank" rel="noopener" className={btn('ghost')}>
                <InstagramIcon className="size-5" /> Instagram
              </a>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-coal p-5 ring-1 ring-white/5">
            <Icon className="size-7 text-ember" />
            <h2 className="mt-3 text-lg font-black">{title}</h2>
            <p className="mt-1 text-white/65">{text}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-5 font-display text-2xl font-black uppercase sm:text-3xl">Komanda</h2>
        <div className="grid gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((m, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-coal p-4 ring-1 ring-white/5">
              <div className="grid size-16 shrink-0 place-items-center rounded-full border border-dashed border-white/20 bg-white/5 text-2xl font-black text-white/30">
                {m.name[0]}
              </div>
              <div>
                <p className="font-bold">{m.name}</p>
                <p className="text-sm text-white/60">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-fire p-8 text-center">
        <h2 className="font-display text-2xl font-black uppercase sm:text-3xl">Gəl, çay içək, maşına baxaq ☕</h2>
        <p className="mt-2 text-white/90">{SITE.address}</p>
        <ButtonLink to="/kataloq" variant="white" className="mt-5">
          Maşınlara bax
        </ButtonLink>
      </section>
    </div>
  );
}
