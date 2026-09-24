import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import RouteError from '@/pages/RouteError';

// Ana səhifə birbaşa yüklənir (TikTok-dan gələnlərin çoxu ora düşür), qalanları lazy.
const Catalog = lazy(() => import('@/pages/Catalog'));
const CarDetail = lazy(() => import('@/pages/CarDetail'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminCars = lazy(() => import('@/pages/admin/AdminCars'));
const AdminStats = lazy(() => import('@/pages/admin/AdminStats'));
const CarForm = lazy(() => import('@/pages/admin/CarForm'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/kataloq', element: <Catalog /> },
      { path: '/masin/:slug', element: <CarDetail /> },
      { path: '/haqqimizda', element: <About /> },
      { path: '/elaqe', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <AdminCars /> },
      { path: 'statistika', element: <AdminStats /> },
      { path: 'masin/yeni', element: <CarForm key="new" /> },
      { path: 'masin/:id', element: <CarForm /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
