import { useEffect } from 'react';

export const publicSiteName = 'Arunreah Dental Clinic';

export function buildPublicDocumentTitle(pageTitle?: string | null) {
  const normalized = pageTitle?.trim();
  return normalized ? `${normalized} | ${publicSiteName}` : publicSiteName;
}

export function usePublicDocumentTitle(pageTitle?: string | null) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = buildPublicDocumentTitle(pageTitle);
  }, [pageTitle]);
}
