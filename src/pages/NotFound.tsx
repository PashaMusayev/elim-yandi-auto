import { ButtonLink } from '@/components/ui/Button';
import { useSeo } from '@/hooks/useSeo';

export default function NotFound() {
  useSeo({ title: 'Səhifə tapılmadı', description: 'Axtardığınız səhifə tapılmadı.' });
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-7xl font-black text-fire">404</p>
        <h1 className="mt-3 text-2xl font-black">Bu səhifə yanıb getdi 🔥</h1>
        <p className="mt-2 text-white/60">Bəlkə maşın artıq satılıb, ya da link səhvdir.</p>
        <ButtonLink to="/kataloq" className="mt-6">
          Kataloqa bax
        </ButtonLink>
      </div>
    </div>
  );
}
