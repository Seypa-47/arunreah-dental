import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';
import { publicLandingChrome } from '@/features/public-content/public-page-chrome';
import { describe, expect, it } from 'vitest';
import { branchBookingHref, BranchesSection, hasLandingContent, HeroSection, OptionalLandingSection } from './LandingPage';

describe('BranchesSection', () => {
  it('renders the supporting eyebrow before the semantic Branches heading without changing branch cards', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter><PublicLanguageProvider>
        <BranchesSection
          branches={[{
            name: 'Psa Chas Branch', hoursDays: 'Monday - Sunday', hoursTime: '8:00 AM - 7:00 PM',
            imageAlt: 'Psa Chas Branch', imageUrl: '', phones: ['069 978 997'],
          }]}
          eyebrow="Our locations"
        />
      </PublicLanguageProvider></MemoryRouter>,
    );

    expect(html.indexOf('Our locations')).toBeLessThan(html.indexOf('<h2'));
    expect(html).toContain('<h2');
    expect(html).toContain('>Branches</h2>');
    expect(html).toContain('Psa Chas Branch');
    expect(html).toContain('aria-label="View Psa Chas Branch"');
    expect(html).toContain('href="/branches"');
  });
});

describe('HeroSection', () => {
  it('loads only the initially visible hero eagerly', () => {
    const hero = {
      address: 'Street 1',
      appointmentLabel: 'Book Appointment',
      branchSlug: 'psa-chas',
      callLabel: 'Call Us',
      imageAlt: 'Clinic',
      imageUrl: '/clinic.jpg',
      locationLabel: 'Location',
      phones: ['012 345 678'],
      qrImageUrl: '',
      qrLabel: 'Clinic information',
    };
    const html = renderToStaticMarkup(
      <MemoryRouter><PublicLanguageProvider><HeroSection heroes={[hero, { ...hero, address: 'Street 2', branchSlug: 'toul-tompoung', imageUrl: '/clinic-2.jpg' }]} /></PublicLanguageProvider></MemoryRouter>,
    );

    expect(html).toContain('fetchPriority="high"');
    expect(html.match(/loading="eager"/g)).toHaveLength(1);
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
    expect(branchBookingHref('toul-tompoung')).toBe('/book-appointment?branch=toul-tompoung');
  });

  it('uses Khmer accessible names for carousel controls', () => {
    const hero = {
      address: 'Street 1', appointmentLabel: 'កក់ការណាត់ជួប', branchSlug: 'psa-chas',
      callLabel: 'ហៅទូរស័ព្ទ', imageAlt: 'គ្លីនិក', imageUrl: '/clinic.jpg',
      locationLabel: 'ទីតាំង', phones: ['012 345 678'], qrImageUrl: '', qrLabel: 'ព័ត៌មានគ្លីនិក',
    };
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PublicLanguageProvider initialLanguage="km">
          <HeroSection heroes={[hero, { ...hero, address: 'Street 2' }]} />
        </PublicLanguageProvider>
      </MemoryRouter>,
    );

    expect(html).toContain('aria-label="សាខាមុន"');
    expect(html).toContain('aria-label="សាខាបន្ទាប់"');
    expect(html).toContain('aria-label="សាខាគ្លីនិក"');
  });
});

describe('landing partial failures', () => {
  it('keeps the page usable when every optional CMS collection is empty', () => {
    const content = publicLandingChrome('en');
    expect(hasLandingContent(content)).toBe(true);
  });

  it.each(['heroes', 'promotions', 'services', 'doctors', 'branches', 'showcase'] as const)(
    'keeps the page usable when %s alone is empty',
    (section) => {
      const content = publicLandingChrome('en');
      content.heroes = [{} as (typeof content.heroes)[number]];
      content.promotions = [{} as (typeof content.promotions)[number]];
      content.services = [{} as (typeof content.services)[number]];
      content.doctors = [{} as (typeof content.doctors)[number]];
      content.branches = [{} as (typeof content.branches)[number]];
      content.showcase = [{} as (typeof content.showcase)[number]];
      content[section] = [];

      expect(hasLandingContent(content)).toBe(true);
    },
  );

  it('distinguishes an empty section from a failed section and localizes Khmer output', () => {
    const emptyHtml = renderToStaticMarkup(
      <PublicLanguageProvider initialLanguage="km">
        <OptionalLandingSection failed={false} label="សេវាកម្ម" onRetry={() => undefined} />
      </PublicLanguageProvider>,
    );
    const failedHtml = renderToStaticMarkup(
      <PublicLanguageProvider initialLanguage="en">
        <OptionalLandingSection failed label="Services" onRetry={() => undefined} />
      </PublicLanguageProvider>,
    );

    expect(emptyHtml).toContain('role="status"');
    expect(emptyHtml).toContain('មិនទាន់មាន');
    expect(failedHtml).toContain('role="alert"');
    expect(failedHtml).toContain('We could not load services.');
    expect(failedHtml).toContain('Retry');
  });
});
