import { Suspense } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminRouteFallback, PublicRouteFallback } from './route-fallbacks';

function PendingRoute(): never {
  throw new Promise(() => undefined);
}

describe('route-level loading fallbacks', () => {
  it('preserves the public header and first-content footprints while a public route loads', () => {
    const markup = renderToStaticMarkup(
      <Suspense fallback={<PublicRouteFallback />}>
        <PendingRoute />
      </Suspense>,
    );

    expect(markup).toContain('public-site');
    expect(markup).toContain('h-[64px]');
    expect(markup).toContain('sm:h-[74px]');
    expect(markup).toContain('min-h-[420px]');
    expect(markup).toContain('<main aria-busy="true"');
    expect(markup.match(/Loading page/g)?.length).toBe(1);
    expect(markup).not.toContain('admin-state-page');
  });

  it('preserves protected admin chrome and content geometry while its lazy route loads', () => {
    const markup = renderToStaticMarkup(
      <div className="admin-ui">
        <Suspense fallback={<AdminRouteFallback />}>
          <PendingRoute />
        </Suspense>
      </div>,
    );

    expect(markup).toContain('admin-workspace');
    expect(markup).toContain('admin-topbar');
    expect(markup).toContain('admin-navigation-panel');
    expect(markup).toContain('admin-breadcrumb');
    expect(markup).toContain('admin-workspace-content bg-[#f6f8fb]');
    expect(markup).toContain('<main aria-busy="true"');
    expect(markup.match(/Loading admin page/g)?.length).toBe(1);
    expect(markup).not.toContain('admin-state-page');
  });
});
