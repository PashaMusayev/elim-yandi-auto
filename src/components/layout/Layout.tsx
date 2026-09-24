import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileBottomBar } from './MobileBottomBar';
import { PageSpinner } from '@/components/ui/PageSpinner';

export function Layout() {
  const { pathname } = useLocation();
  const onCarPage = useMatch('/masin/:slug');
  // Diqqət: effekt heç nə qaytarmamalıdır — yeni brauzerlərdə scrollTo() Promise qaytarır,
  // React isə qaytarılan dəyəri cleanup funksiyası kimi çağırır ("l is not a function").
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!onCarPage && <MobileBottomBar />}
    </div>
  );
}
