import { describe, expect, it } from 'vitest';
import { normalizeCmsListQuery } from './cms';

describe('CMS list query normalization', () => {
  it('uses a stable, compact query representation for equivalent filters', () => {
    expect(normalizeCmsListQuery({ status: 'PUBLISHED', page: 2, search: '', featured: undefined }))
      .toBe('?page=2&status=PUBLISHED');
  });
});
