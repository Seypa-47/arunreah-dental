import { describe, expect, it } from 'vitest';
import { publicLandingChrome } from './public-page-chrome';

describe('public landing chrome', () => {
  it('provides the Branches eyebrow in English and Khmer without changing CMS branch data', () => {
    expect(publicLandingChrome('en').branchesEditorial).toEqual({ eyebrow: 'Our locations' });
    expect(publicLandingChrome('km').branchesEditorial).toEqual({ eyebrow: 'សាខារបស់យើង' });
    expect(publicLandingChrome('en').branches).toEqual([]);
    expect(publicLandingChrome('km').branches).toEqual([]);
  });
});
