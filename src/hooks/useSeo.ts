import { useEffect } from 'react';
import { SITE } from '@/config/site';

interface Seo {
  title: string;
  description: string;
  image?: string;
  path?: string;
  jsonLd?: Record<string, unknown>;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Hər səhifə üçün başlıq, description, OG və canonical. */
export function useSeo({ title, description, image, path, jsonLd }: Seo) {
  useEffect(() => {
    const full = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    if (image) setMeta('property', 'og:image', image);
    const url = `${SITE.url}${path ?? location.pathname}`;
    setMeta('property', 'og:url', url);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, image, path, jsonLd]);
}
