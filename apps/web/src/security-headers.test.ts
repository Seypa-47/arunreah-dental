import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Cloudflare Pages security headers', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

  it('sets the required browser security policy', () => {
    for (const name of [
      'Content-Security-Policy',
      'Permissions-Policy',
      'Referrer-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ]) {
      expect(headers).toContain(`${name}:`);
    }
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain('https://challenges.cloudflare.com');
    expect(headers).toContain('https://www.google.com');
    expect(headers).toContain('https://fonts.googleapis.com');
    expect(headers).toContain('https://fonts.gstatic.com');
    expect(headers).toContain('https://media.arunreah.mekhla.digital');
    expect(headers).not.toContain("script-src 'self' 'unsafe-inline'");
  });
});
