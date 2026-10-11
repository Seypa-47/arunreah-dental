import { describe, expect, it } from 'vitest';
import { nextKhmerCategory, showcaseCategoryOptions, suggestedKhmerCategory } from './showcase-categories';

describe('showcase categories', () => {
  it('suggests Khmer wording for every English category', () => {
    for (const category of showcaseCategoryOptions) {
      expect(suggestedKhmerCategory(category)).not.toBe('');
    }
    expect(suggestedKhmerCategory('Patient Education')).toBe('ការអប់រំអ្នកជំងឺ');
    expect(suggestedKhmerCategory('Not a category')).toBe('');
    expect(suggestedKhmerCategory(null)).toBe('');
  });

  it('fills an empty Khmer field when the English category changes', () => {
    expect(nextKhmerCategory('', 'Treatment', 'Technology')).toBe('បច្ចេកវិទ្យា');
  });

  it('replaces the previous suggestion so the pair stays in step', () => {
    expect(nextKhmerCategory('ការព្យាបាល', 'Treatment', 'Technology')).toBe('បច្ចេកវិទ្យា');
  });

  it('never overwrites wording the clinic typed themselves', () => {
    expect(nextKhmerCategory('ការថែទាំពិសេស', 'Treatment', 'Technology')).toBe('ការថែទាំពិសេស');
  });
});
