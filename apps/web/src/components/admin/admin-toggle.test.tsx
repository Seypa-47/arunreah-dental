import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { AdminToggle } from './admin-toggle';

describe('AdminToggle', () => {
  it('uses the accessible switch pattern and identifies its setting', () => {
    const html = renderToStaticMarkup(<AdminToggle checked={false} label="Show on homepage" onChange={vi.fn()} />);

    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
    expect(html).toContain('aria-label="Show on homepage"');
  });
});
