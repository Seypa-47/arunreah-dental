import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('public accessibility CSS safeguards', () => {
  const styles = readFileSync(new URL('./styles/index.css', import.meta.url), 'utf8');

  it('honors reduced-motion preferences for public pages', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('.public-site *');
    expect(styles).toContain('animation-duration: 0.01ms !important');
    expect(styles).toContain('transition-duration: 0.01ms !important');
  });

  it('overrides known low-contrast public text colors with reviewed alternatives', () => {
    expect(styles).toContain('color: #0d7596');
    expect(styles).toContain('color: #526879');
  });
});
