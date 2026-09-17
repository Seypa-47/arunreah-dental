import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CmsImage, ImageFrame } from './public-ui';

describe('public CMS image primitives', () => {
  it('lazy-loads card media with async decoding by default', () => {
    const html = renderToStaticMarkup(<ImageFrame alt="Clinic" className="h-40" src="/image.jpg" />);

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });

  it('supports explicit eager priority and saved focal-point presentation', () => {
    const html = renderToStaticMarkup(
      <CmsImage alt="Clinic" loading="eager" presentation={{ positionX: 32, positionY: 18, zoom: 1.15 }} src="/image.jpg" />,
    );

    expect(html).toContain('loading="eager"');
    expect(html).toContain('object-position:32% 18%');
    expect(html).toContain('scale(1.15)');
  });

  it('falls back to default clinic asset when src is not provided', () => {
    const html = renderToStaticMarkup(<CmsImage alt="Clinic fallback" />);
    expect(html).toContain('src="/assets/landing/hero-clinic.png"');
  });

  it('uses custom fallbackSrc when provided without src', () => {
    const html = renderToStaticMarkup(<CmsImage alt="Custom" fallbackSrc="/custom-fallback.png" />);
    expect(html).toContain('src="/custom-fallback.png"');
  });
});
