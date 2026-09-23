import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CmsImage, ImageFrame, renderHeroTitle } from './public-ui';

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

describe('renderHeroTitle', () => {
  it('splits English title with Dental Clinic into two parts with blue second line', () => {
    const html = renderToStaticMarkup(<>{renderHeroTitle('About Arunreah Dental Clinic', 'en')}</>);
    expect(html).toContain('<span>About Arunreah</span>');
    expect(html).toContain('<span class="block text-[#0080c8]">Dental Clinic</span>');
  });

  it('splits English title with Dental Team into two parts with blue second line', () => {
    const html = renderToStaticMarkup(<>{renderHeroTitle('Meet the Arunreah Dental Team', 'en')}</>);
    expect(html).toContain('<span>Meet the Arunreah</span>');
    expect(html).toContain('<span class="block text-[#0080c8]">Dental Team</span>');
  });

  it('splits Khmer title with អរុណរះ into two parts with blue second line', () => {
    const html = renderToStaticMarkup(<>{renderHeroTitle('អំពី គ្លីនិកធ្មេញ អរុណរះ', 'km')}</>);
    expect(html).toContain('<span>អំពី គ្លីនិកធ្មេញ</span>');
    expect(html).toContain('<span class="block text-[#0080c8]">អរុណរះ</span>');
  });

  it('handles single word or short title gracefully without splitting', () => {
    const html = renderToStaticMarkup(<>{renderHeroTitle('Welcome', 'en')}</>);
    expect(html).toBe('<span>Welcome</span>');
  });
});
