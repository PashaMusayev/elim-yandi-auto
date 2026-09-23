import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PageSpinner } from './components/ui/PageSpinner';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<PageSpinner />}>
      <App />
    </Suspense>
  </StrictMode>,
);
