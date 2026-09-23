import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { BarChart3, Car, ExternalLink, LogOut, Plus } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { Logo } from '@/components/layout/Logo';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { checkIsAdmin, signOut } from '@/lib/admin';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import AdminLogin from './AdminLogin';

type Gate = 'loading' | 'anon' | 'forbidden' | 'ok';

export default function AdminLayout() {
  const [gate, setGate] = useState<Gate>('loading');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    document.title = 'Admin | Elim Yandı Auto';
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex,nofollow';
    return () => robots?.remove();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const evaluate = async (s: Session | null) => {
      setSession(s);
      if (!s) return setGate('anon');
      try {
        setGate((await checkIsAdmin()) ? 'ok' : 'forbidden');
      } catch {
        setGate('forbidden');
      }
    };
    supabase.auth.getSession().then(({ data }) => evaluate(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      // Token yenilənməsində yenidən yoxlamağa ehtiyac yoxdur
      if (_e === 'SIGNED_IN' || _e === 'SIGNED_OUT') void evaluate(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl bg-coal p-6 text-center">
          <h1 className="text-xl font-black">Supabase qoşulmayıb</h1>
          <p className="mt-2 text-white/70">
            Admin panel üçün <code className="text-ember">.env</code> faylına <code>VITE_SUPABASE_URL</code> və{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> yazın (README-yə baxın).
          </p>
        </div>
      </Shell>
    );
  }
  if (gate === 'loading') return <PageSpinner />;
  if (gate === 'anon') return <AdminLogin />;
  if (gate === 'forbidden') {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl bg-coal p-6 text-center">
          <h1 className="text-xl font-black">İcazə yoxdur 🚫</h1>
          <p className="mt-2 text-white/70">{session?.user.email} admin siyahısında deyil.</p>
          <button type="button" onClick={() => signOut()} className="mt-4 font-bold text-ember">
            Çıxış
          </button>
        </div>
      </Shell>
    );
  }

  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold md:flex-row md:gap-2 md:rounded-lg md:px-3 md:text-sm ${
      isActive ? 'text-ember' : 'text-white/70'
    }`;

  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/90 backdrop-blur">
        <div className="container-x flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-bold">ADMIN</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/admin" end className={tab}>
              <Car className="size-4" /> Maşınlar
            </NavLink>
            <NavLink to="/admin/statistika" className={tab}>
              <BarChart3 className="size-4" /> Statistika
            </NavLink>
          </nav>
          <div className="flex items-center gap-1">
            <Link to="/" target="_blank" className="grid size-10 place-items-center rounded-lg text-white/70" aria-label="Sayta bax">
              <ExternalLink className="size-5" />
            </Link>
            <button type="button" onClick={() => signOut()} className="grid size-10 place-items-center rounded-lg text-white/70" aria-label="Çıxış">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="container-x py-5">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      {/* Mobil alt naviqasiya — ortada böyük "+" */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur md:hidden">
        <div className="flex h-16 items-center px-4">
          <NavLink to="/admin" end className={tab}>
            <Car className="size-5" /> Maşınlar
          </NavLink>
          <Link
            to="/admin/masin/yeni"
            className="-mt-8 grid size-16 place-items-center rounded-full bg-fire shadow-[0_8px_24px_-6px_rgba(255,77,26,.8)]"
            aria-label="Yeni maşın əlavə et"
          >
            <Plus className="size-8" />
          </Link>
          <NavLink to="/admin/statistika" className={tab}>
            <BarChart3 className="size-5" /> Statistika
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="w-full">{children}</div>
    </div>
  );
}
