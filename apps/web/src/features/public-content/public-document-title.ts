import { useEffect } from 'react';

export const publicSiteName = 'Arunreah Dental Clinic';
export const publicSiteOrigin = 'https://arunreahdental.com';
export const defaultPublicDescription =
  'Arunreah Dental Clinic provides patient-focused dental care in Phnom Penh, Cambodia, with an emphasis on comfort, precision, and clinical excellence.';
export const defaultPublicImage = `${publicSiteOrigin}/assets/landing/hero-psa-chas.webp`;

type PublicSeoOptions = {
  imageUrl?: string | null;
  noIndex?: boolean;
  structuredData?: Readonly<Record<string, unknown>> | readonly Readonly<Record<string, unknown>>[] | null;
  type?: 'article' | 'profile' | 'website';
};

export function buildPublicDocumentTitle(pageTitle?: string | null) {
  const normalized = pageTitle?.trim();
  if (!normalized) return publicSiteName;
  return normalized.toLowerCase().includes(publicSiteName.toLowerCase())
    ? normalized
    : `${normalized} | ${publicSiteName}`;
}

export function normalizePublicDescription(description?: string | null) {
  const normalized = description?.replaceAll(/\s+/g, ' ').trim();
  return normalized || defaultPublicDescription;
}

export function absolutePublicUrl(value?: string | null) {
  if (!value?.trim()) return undefined;
  try {
    return new URL(value, publicSiteOrigin).toString();
  } catch {
    return undefined;
  }
}

export function buildBreadcrumbStructuredData(items: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, publicSiteOrigin).toString(),
    })),
  } as const;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.append(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}

export function usePublicDocumentTitle(
  pageTitle?: string | null,
  description?: string | null,
  options: PublicSeoOptions = {},
) {
  const structuredData = options.structuredData ? JSON.stringify(options.structuredData) : undefined;

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const title = buildPublicDocumentTitle(pageTitle);
    const normalizedDescription = normalizePublicDescription(description);
    const canonicalUrl = new URL(window.location.pathname, publicSiteOrigin).toString();
    const imageUrl = absolutePublicUrl(options.imageUrl) ?? defaultPublicImage;
    const locale = document.documentElement.lang.toLowerCase().startsWith('km') ? 'km_KH' : 'en_US';
    const robots = options.noIndex
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    document.title = title;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
    upsertMeta('meta[name="description"]', { name: 'description', content: normalizedDescription });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: normalizedDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: options.type ?? 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: publicSiteName });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: locale });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: title });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: normalizedDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });

    let pageStructuredData = document.head.querySelector<HTMLScriptElement>('script#public-page-structured-data');
    if (structuredData) {
      if (!pageStructuredData) {
        pageStructuredData = document.createElement('script');
        pageStructuredData.id = 'public-page-structured-data';
        pageStructuredData.type = 'application/ld+json';
        document.head.append(pageStructuredData);
      }
      pageStructuredData.textContent = structuredData;
    } else {
      pageStructuredData?.remove();
    }
  }, [description, options.imageUrl, options.noIndex, options.type, pageTitle, structuredData]);
}
