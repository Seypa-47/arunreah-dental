import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { AdminPageMediaPage, getNextPageMediaDisplayOrder } from './AdminPageMediaPage';

vi.mock('@/services/cms', () => ({
  cmsApi: {
    pageMedia: {
      create: vi.fn(),
      delete: vi.fn(),
      list: vi.fn().mockResolvedValue({ items: [] }),
      update: vi.fn(),
    },
  },
}));

describe('AdminPageMediaPage clinic galleries', () => {
  it('opens the requested branch gallery with gallery-specific editing copy', () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/admin/page-media?placement=ABOUT_CLINIC_GALLERY_PSA_CHAS']}>
          <AdminPageMediaPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(html).toContain('About · Clinic Gallery · Psa Chas');
    expect(html).toContain('Gallery photos');
    expect(html).toContain('Add gallery photo');
    expect(html).toContain('Caption · English');
    expect(html).toContain('ចំណងជើងរូបភាព · ខ្មែរ');
    expect(html).toContain('add as many as needed');
    expect(html).not.toContain('Public gallery layout');
    expect(html).not.toContain('up to four photos');
    expect(html).not.toContain('Edit in Showcases');
  });

  it('places each additional photo after the current highest display order', () => {
    expect(getNextPageMediaDisplayOrder([])).toBe(1);
    expect(getNextPageMediaDisplayOrder([
      { displayOrder: 1 },
      { displayOrder: 5 },
      { displayOrder: 3 },
      { displayOrder: 2 },
      { displayOrder: 4 },
    ])).toBe(6);
  });
});
