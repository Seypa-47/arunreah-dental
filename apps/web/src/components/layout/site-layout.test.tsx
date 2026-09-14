import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SiteLayout } from './site-layout';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isError: false, isLoading: false }),
}));
vi.mock('@/features/public-content/public-language-provider', () => ({
  usePublicLanguage: () => ({ language: 'en', setLanguage: vi.fn() }),
}));

describe('public site layout', () => {
  const render = () =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={['/about']}>
        <SiteLayout
          actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }}
          navigation={[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About' },
          ]}
        >
          <main>
            <h1>About the clinic</h1>
          </main>
        </SiteLayout>
      </MemoryRouter>,
    );

  it('offers a keyboard skip link to a focusable main content target', () => {
    const html = render();
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('Skip to main content');
    expect(html).toContain('id="main-content" tabindex="-1"');
  });

  it('renders the skip link before the header so it is the first stop for keyboard users', () => {
    const html = render();
    expect(html.indexOf('href="#main-content"')).toBeLessThan(html.indexOf('<header'));
  });

  it('preserves the page content inside the main content target', () => {
    const html = render();
    const wrapperIndex = html.indexOf('id="main-content"');
    const headingIndex = html.indexOf('<h1>About the clinic</h1>');
    expect(wrapperIndex).toBeGreaterThan(-1);
    expect(headingIndex).toBeGreaterThan(wrapperIndex);
  });

  it('still renders the desktop nav, mobile menu toggle, and language switcher', () => {
    const html = render();
    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain('aria-controls="mobile-primary-navigation"');
    expect(html).toContain('aria-label="Language selector"');
  });
});
