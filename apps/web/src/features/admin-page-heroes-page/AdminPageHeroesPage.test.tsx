import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPageHeroesPage, HERO_PAGES, heroPreviewShowsImage } from './AdminPageHeroesPage';

vi.mock('@/services/cms', () => ({
  cmsApi: {
    pageMedia: {
      list: vi.fn().mockResolvedValue({
        items: [
          {
            id: 'hero-1',
            placement: 'ABOUT_HERO',
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
    expect(html).toContain(
      'Manage the bilingual titles, subtitles, eyebrow badges, and hero images',
    );
  });

  it('renders every editable page hero selector tab', () => {
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

  it('renders the preview section with a language toggle', () => {
    const html = renderPage();
    expect(html).toContain('Preview');
    expect(html).toContain('Preview language:');
    expect(html).toContain('English');
    expect(html).toContain('ខ្មែរ');
  });

  it('shows only published branch slides in the homepage carousel overview', () => {
    const html = renderPage();
    expect(html).toContain('Homepage carousel');
    expect(html).toContain('0 live slides');
    expect(html).not.toContain('Optional main site slide');
    expect(html).not.toContain('Main site hero');
    expect(HERO_PAGES.find((page) => page.id === 'home')).toBeUndefined();
  });

  it('only previews a background image for services and showcases after one is selected', () => {
    const services = HERO_PAGES.find((page) => page.id === 'services');
    const showcases = HERO_PAGES.find((page) => page.id === 'showcases');
    const doctors = HERO_PAGES.find((page) => page.id === 'doctors');

    expect(services).toBeDefined();
    expect(showcases).toBeDefined();
    expect(doctors).toBeDefined();
    expect(heroPreviewShowsImage(services!, '')).toBe(false);
    expect(heroPreviewShowsImage(showcases!, '')).toBe(false);
    expect(heroPreviewShowsImage(services!, 'clinic/services.jpg')).toBe(true);
    expect(heroPreviewShowsImage(doctors!, '')).toBe(true);
  });

  it('marks the doctors hero as image-only so unused copy fields are not offered', () => {
    const doctors = HERO_PAGES.find((page) => page.id === 'doctors');

    expect(doctors?.supportsCopy).toBe(false);
    expect(doctors?.previewLayout).toBe('image-only');
  });
});
