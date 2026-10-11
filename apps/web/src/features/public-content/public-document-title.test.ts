import { describe, expect, it } from 'vitest';
import { buildPublicDocumentTitle } from './public-document-title';

describe('buildPublicDocumentTitle', () => {
  it('adds the clinic name to a page-specific title', () => {
    expect(buildPublicDocumentTitle('Our Services')).toBe('Our Services | Arunreah Dental Clinic');
  });

  it('falls back safely when page content is unavailable', () => {
    expect(buildPublicDocumentTitle('  ')).toBe('Arunreah Dental Clinic');
    expect(buildPublicDocumentTitle()).toBe('Arunreah Dental Clinic');
  });
});
