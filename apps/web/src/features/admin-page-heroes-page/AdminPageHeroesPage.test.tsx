import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPageHeroesPage, HERO_PAGES } from './AdminPageHeroesPage';

vi.mock('@/services/cms', () => ({
  cmsApi: {
    pageMedia: {
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'hero-1',
            placement: 'HOME_HERO',
            status: 'PUBLISHED',
            imageKey: 'clinic/sample.jpg',
            imagePresentation: { positionX: 50, positionY: 50, zoom: 1 },
            titleEn: 'Sample Title',
            titleKm: '',
            bodyEn: 'Sample Body',
            bodyKm: '',
            badgeEn: 'Sample Badge',
            badgeKm: '',
            displayOrder: 0,
            createdAt: '2026-09-20T00:00:00Z',
            updatedAt: '2026-09-20T00:00:00Z',
          },
        ],
      }),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('@/services/media', () => ({
  getPublicMediaUrl: (key?: string) => (key ? `https://media.arunreah.com/${key}` : undefined),
  uploadMedia: vi.fn(),
}));

describe('AdminPageHeroesPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderPage = () =>
    renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/admin/page-heroes']}>
          <AdminPageHeroesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders page header and introductory text', () => {
    const html = renderPage();
    expect(html).toContain('Hero sections');
    expect(html).toContain('Website Content Management');
    expect(html).toContain('Manage the bilingual titles, subtitles, eyebrow badges, and hero images');
  });

  it('renders all 8 page hero selector tabs', () => {
    const html = renderPage();
    for (const page of HERO_PAGES) {
      expect(html).toContain(page.name);
    }
  });

  it('renders bilingual form inputs and sections', () => {
    const html = renderPage();
    expect(html).toContain('Hero Background Photo');
    expect(html).toContain('Title · English');
    expect(html).toContain('ចំណងជើងធំ · ខ្មែរ');
    expect(html).toContain('Badge · English');
    expect(html).toContain('ផ្លាកចំណងជើង · ខ្មែរ');
    expect(html).toContain('Description · English');
    expect(html).toContain('ការពិពណ៌នា · ខ្មែរ');
    expect(html).toContain('Save Hero Section');
  });

  it('renders live preview section with language toggle', () => {
    const html = renderPage();
    expect(html).toContain('Live Preview');
    expect(html).toContain('Preview language:');
    expect(html).toContain('English');
    expect(html).toContain('ខ្មែរ');
  });

  it('explains every source that can appear in the homepage carousel', () => {
    const html = renderPage();
    expect(html).toContain('Homepage carousel slides');
    expect(html).toContain('Main site hero');
    expect(html).toContain('Branch slides are shown above and managed in Branches &amp; Locations.');
  });
});
