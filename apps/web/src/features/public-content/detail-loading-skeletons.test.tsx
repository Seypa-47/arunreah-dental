import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ServiceDetailSkeleton } from '@/features/service-detail-page/ServiceDetailPage';
import { ShowcaseDetailPageSkeleton } from '@/features/showcase-detail-page/ShowcaseDetailPage';
import { TeamMemberProfileSkeleton } from '@/features/team-member-profile-page/TeamMemberProfilePage';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isError: false, isLoading: true }),
}));

function renderSkeleton(Skeleton: ComponentType) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <PublicLanguageProvider initialLanguage="en">
        <Skeleton />
      </PublicLanguageProvider>
    </MemoryRouter>,
  );
}

function expectAttributeOrder(markup: string, attribute: string, values: string[]) {
  const positions = values.map((value) => markup.indexOf(`${attribute}="${value}"`));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((left, right) => left - right));
}

function expectAccessibleLoadingState(markup: string, message: string) {
  expect(markup.match(/<main aria-busy="true"/g)?.length).toBe(1);
  expect(markup.match(new RegExp(message, 'g'))?.length).toBe(1);
  expect(markup).toContain(`<span class="sr-only">${message}</span>`);
  expect(markup.slice(markup.indexOf('<main aria-busy="true"'))).not.toContain('animate-pulse');

  const skeletonElements = markup.match(/<(?:div|section)[^>]*data-skeleton="[^"]+"[^>]*>/g) ?? [];
  expect(skeletonElements.length).toBeGreaterThan(0);
  expect(skeletonElements.every((element) => element.includes('aria-hidden="true"'))).toBe(true);
}

describe('public detail loading skeletons', () => {
  it('preserves the team profile topology and desktop/mobile geometry', () => {
    const markup = renderSkeleton(TeamMemberProfileSkeleton);

    expectAccessibleLoadingState(markup, 'Loading team member profile');
    expectAttributeOrder(markup, 'data-skeleton-section', ['profile-hero', 'profile-content', 'related-team']);
    expectAttributeOrder(markup, 'data-skeleton-slot', [
      'back-link',
      'portrait',
      'appointment-action',
      'biography',
      'qualifications-or-responsibilities',
      'desktop-sidebar',
    ]);
    expect(markup).toContain('aspect-[15/16]');
    expect(markup).toContain('md:h-[360px]');
    expect(markup).toContain('lg:grid-cols-[minmax(0,1fr)_320px]');
    expect(markup).toContain('space-y-4 lg:sticky lg:top-24 lg:self-start');
    expect(markup).toContain('md:grid-cols-2');
    expect(markup).toContain('xl:grid-cols-4');
  });

  it('uses a presentation-neutral service detail topology at every breakpoint', () => {
    const markup = renderSkeleton(ServiceDetailSkeleton);

    expectAccessibleLoadingState(markup, 'Loading treatment information');
    expectAttributeOrder(markup, 'data-skeleton-section', [
      'service-hero',
      'service-overview',
      'treatment-content',
      'related-services',
      'service-cta',
    ]);
    expect(markup).toContain('data-skeleton-slot="media-or-guide"');
    expect(markup).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)]');
    expect(markup).toContain('sm:grid-cols-2');
    expect(markup).toContain('lg:grid-cols-3');
    expect(markup.match(/data-skeleton-card="treatment"/g)?.length).toBe(3);
    expect(markup.match(/data-skeleton-card="related-service"/g)?.length).toBe(3);
    expect(markup).not.toContain('JOURNEY');
    expect(markup).not.toContain('CARE_MENU');
  });

  it('matches the showcase article without promising related content', () => {
    const markup = renderSkeleton(ShowcaseDetailPageSkeleton);

    expectAccessibleLoadingState(markup, 'Loading showcase article');
    expectAttributeOrder(markup, 'data-skeleton-section', ['showcase-cover', 'showcase-article']);
    expectAttributeOrder(markup, 'data-skeleton-slot', [
      'back-link',
      'cover-image',
      'title',
      'summary',
      'body',
      'content-section',
    ]);
    expect(markup).toContain('h-[250px]');
    expect(markup).toContain('sm:h-[390px]');
    expect(markup).toContain('h-[200px]');
    expect(markup).toContain('sm:h-[420px]');
    expect(markup).not.toContain('data-skeleton-section="related-showcases"');
    expect(markup).not.toContain('data-skeleton-card="related-showcase"');
  });
});
