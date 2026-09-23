import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PublicLanguageProvider } from '@/features/public-content/public-language-provider';
import { describe, expect, it } from 'vitest';
import { BranchesSection } from './LandingPage';

describe('BranchesSection', () => {
  it('renders the supporting eyebrow before the semantic Branches heading without changing branch cards', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter><PublicLanguageProvider>
        <BranchesSection
          branches={[{
            name: 'Psa Chas Branch', hours: 'Monday - Sunday, 8:00 AM - 7:00 PM',
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
  });
});
