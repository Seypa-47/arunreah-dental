import { useEffect } from 'react';

export const publicSiteName = 'Arunreah Dental Clinic';

export function buildPublicDocumentTitle(pageTitle?: string | null) {
  const normalized = pageTitle?.trim();
  return normalized ? `${normalized} | ${publicSiteName}` : publicSiteName;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.append(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}

export function usePublicDocumentTitle(pageTitle?: string | null, description?: string | null) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const title = buildPublicDocumentTitle(pageTitle);
    const canonicalUrl = new URL(window.location.pathname, window.location.origin).toString();
    document.title = title;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    if (description?.trim()) {
      upsertMeta('meta[name="description"]', { name: 'description', content: description.trim() });
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description.trim() });
    }
  }, [description, pageTitle]);
}
