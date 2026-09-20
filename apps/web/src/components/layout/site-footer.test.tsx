import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SiteFooter } from './site-footer';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(({ queryKey }: { queryKey: readonly unknown[] }) => {
    if (queryKey[1] === 'branches') {
      return {
        data: {
          branches: [
            { id: '1', name: 'សាខាផ្សារចាស់', slug: 'psa-chas' },
            { id: '2', name: 'សាខាទួលទំពូង', slug: 'toul-tompoung' },
          ],
        },
        isLoading: false,
      };
    }
    return { data: undefined, isLoading: false };
  }),
}));

vi.mock('@/features/public-content/public-language-provider', () => ({
  usePublicLanguage: () => ({ language: 'km', setLanguage: vi.fn() }),
}));

describe('SiteFooter', () => {
  it('renders branch links dynamically when branchLinks prop is empty (like on non-landing pages)', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <SiteFooter
          branchLinks={[]}
          description="Clinic description"
          linkGroups={[]}
          tagline="Clinic tagline"
        />
      </MemoryRouter>,
    );

    expect(html).toContain('Our Branches');
    expect(html).toContain('សាខាផ្សារចាស់');
    expect(html).toContain('សាខាទួលទំពូង');
    expect(html).toContain('href="/branches"');
  });

  it('renders provided branchLinks if available', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <SiteFooter
          branchLinks={[{ href: '/branches', label: 'Custom Branch' }]}
          description="Clinic description"
          linkGroups={[]}
          tagline="Clinic tagline"
        />
      </MemoryRouter>,
    );

    expect(html).toContain('Our Branches');
    expect(html).toContain('សាខាផ្សារចាស់');
  });
});
