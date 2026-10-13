import { describe, expect, it } from 'vitest';
import {
  absolutePublicUrl,
  buildBreadcrumbStructuredData,
  buildPublicDocumentTitle,
  defaultPublicDescription,
  normalizePublicDescription,
} from './public-document-title';

describe('buildPublicDocumentTitle', () => {
  it('adds the clinic name to a page-specific title', () => {
    expect(buildPublicDocumentTitle('Our Services')).toBe('Our Services | Arunreah Dental Clinic');
  });

  it('does not duplicate a clinic name already supplied by the CMS', () => {
    expect(buildPublicDocumentTitle('Dental Implants in Phnom Penh | Arunreah Dental Clinic')).toBe(
      'Dental Implants in Phnom Penh | Arunreah Dental Clinic',
    );
  });

  it('falls back safely when page content is unavailable', () => {
    expect(buildPublicDocumentTitle('  ')).toBe('Arunreah Dental Clinic');
    expect(buildPublicDocumentTitle()).toBe('Arunreah Dental Clinic');
  });

  it('normalizes CMS descriptions and provides a stable fallback', () => {
    expect(normalizePublicDescription('  Gentle dental care\n in Phnom Penh.  ')).toBe(
      'Gentle dental care in Phnom Penh.',
    );
    expect(normalizePublicDescription()).toBe(defaultPublicDescription);
  });

  it('builds canonical absolute URLs and breadcrumb schema', () => {
    expect(absolutePublicUrl('/team/chho-sonthary')).toBe(
      'https://arunreahdental.com/team/chho-sonthary',
    );
    expect(buildBreadcrumbStructuredData([{ name: 'Home', path: '/' }])).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [{ item: 'https://arunreahdental.com/', name: 'Home', position: 1 }],
    });
  });
});
