import { describe, expect, it } from 'vitest';
import { initialPublicLanguage, publicLanguageStorageKey, storedPublicLanguage } from './public-language-provider';

describe('public language persistence helpers', () => {
  it('defaults to English when neither storage nor the document supplies Khmer', () => {
    expect(initialPublicLanguage(undefined, 'en')).toBe('en');
  });

  it('restores a persisted Khmer choice before the document language', () => {
    expect(initialPublicLanguage('km', 'en')).toBe('km');
    expect(publicLanguageStorageKey).toBe('arunreah-public-language');
  });

  it('rejects invalid stored values and safely falls back to the document language', () => {
    expect(storedPublicLanguage('fr')).toBeUndefined();
    expect(initialPublicLanguage('fr', 'km-KH')).toBe('km');
    expect(initialPublicLanguage('fr', 'en')).toBe('en');
  });
});
