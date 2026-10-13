import { renderToStaticMarkup } from 'react-dom/server';
import type { ComponentType } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';
import { DoctorsPageSkeleton } from '@/features/doctors-page/DoctorsPage';
import { LandingPageSkeleton } from '@/features/landing-page/LandingPage';
import { ServicesPageSkeleton } from '@/features/services-page/ServicesPage';
import { ShowcasesPageSkeleton } from '@/features/showcases-page/ShowcasesPage';

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

describe('public loading skeleton topology', () => {
  it('matches the homepage section order through its optional showcase area', () => {
    const markup = renderSkeleton(LandingPageSkeleton);

    expectAttributeOrder(markup, 'data-skeleton-section', ['hero', 'promotions', 'services', 'specialists', 'branches', 'showcase']);
    expect(markup).toContain('h-[320px]');
    expect(markup).toContain('lg:h-[510px]');
    expect(markup).toContain('lg:top-[468px]');
    expect(markup).toContain('aspect-[16/10]');
    expect(markup).toContain('lg:grid-cols-2');
  });

  it('preserves the team hero, sticky navigation, category groups, and card geometry', () => {
    const markup = renderSkeleton(DoctorsPageSkeleton);

    expectAttributeOrder(markup, 'data-skeleton-section', ['hero', 'category-navigation', 'team-directory']);
    expect(markup).toContain('sm:min-h-[360px]');
    expect(markup).toContain('lg:min-h-[460px]');
    expect(markup).toContain('sticky top-[64px]');
    expectAttributeOrder(markup, 'data-skeleton-group', ['dentists', 'general-practitioners', 'receptionists', 'assistants']);
    expect(markup).toContain('xl:grid-cols-4');
    expect(markup).toContain('sm:aspect-[11/10]');
  });

  it('uses the media hero and one responsive representative row for services', () => {
    const markup = renderSkeleton(ServicesPageSkeleton);

    expectAttributeOrder(markup, 'data-skeleton-section', ['hero', 'services', 'cta']);
    expect(markup).toContain('min-h-[320px]');
    expect(markup).toContain('sm:min-h-[380px]');
    expect(markup).toContain('lg:min-h-[420px]');
    expect(markup).toContain('sm:grid-cols-2');
    expect(markup).toContain('lg:grid-cols-3');
    expect(markup.match(/data-skeleton-card="service"/g)?.length).toBe(3);
    expect(markup).toContain('h-[190px]');
    expect(markup).not.toContain('data-skeleton-card="service" data-count');
  });

  it('matches showcase hero and cards without adding a CTA section', () => {
    const markup = renderSkeleton(ShowcasesPageSkeleton);

    expectAttributeOrder(markup, 'data-skeleton-section', ['hero', 'showcases']);
    expect(markup).toContain('min-h-[320px]');
    expect(markup).toContain('h-[220px]');
    expect(markup).toContain('sm:min-h-[184px]');
    expect(markup).not.toContain('data-skeleton-section="cta"');
  });
});
