import { readFileSync } from 'node:fs';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonImage,
  SkeletonSection,
  SkeletonText,
} from './skeleton';

describe('skeleton primitives', () => {
  it('marks every decorative primitive as hidden from assistive technology', () => {
    const markup = renderToStaticMarkup(
      <>
        <SkeletonBlock />
        <SkeletonText />
        <SkeletonImage />
        <SkeletonCard />
        <SkeletonSection />
      </>,
    );

    expect(markup).toContain('data-skeleton="block"');
    expect(markup).toContain('data-skeleton="text"');
    expect(markup).toContain('data-skeleton="image"');
    expect(markup).toContain('data-skeleton="card"');
    expect(markup).toContain('data-skeleton="section"');
    expect(markup.match(/aria-hidden="true"/g)?.length).toBe(8);
  });

  it('renders the requested number and widths of text lines', () => {
    const markup = renderToStaticMarkup(
      <SkeletonText lines={2} widths={['90%', '55%']} lineClassName="h-4" />,
    );

    expect(markup.match(/data-skeleton="block"/g)?.length).toBe(2);
    expect(markup).toContain('width:90%');
    expect(markup).toContain('width:55%');
    expect(markup.match(/h-4/g)?.length).toBe(2);
  });

  it('provides a reduced-motion fallback for the shared animation', () => {
    const css = readFileSync(new URL('../../styles/index.css', import.meta.url), 'utf8');

    expect(css).toContain('@keyframes skeleton-shimmer');
    expect(css).toContain('.skeleton-shimmer');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/\.skeleton-shimmer\s*{[^}]*animation:\s*none !important;/s);
  });
});
