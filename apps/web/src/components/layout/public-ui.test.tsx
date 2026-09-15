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
});
