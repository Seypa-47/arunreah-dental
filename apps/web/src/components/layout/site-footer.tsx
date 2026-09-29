import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { LandingFooterLinkGroup, LandingPageContent } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches, getPublicClinic, getPublicContact } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

const asset = (name: string) => `/assets/landing/${name}`;

function FooterLinks({ group }: { group: LandingFooterLinkGroup }) {
  return (
    <div>
      <h2 className="mb-3 text-[15px] font-extrabold leading-6 text-[#075d83]">{group.title}</h2>
      <ul className="space-y-2.5">
        {group.links.map((link) => {
          const isInternal = link.href.startsWith('/');
          return (
            <li key={link.label}>
              {isInternal ? (
                <Link
                  className="inline-flex min-h-11 items-center text-[14px] font-medium leading-6 text-[#607486] underline-offset-4 hover:text-[#087b9f] hover:underline"
                  to={link.href}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  className="inline-flex min-h-11 items-center text-[14px] font-medium leading-6 text-[#607486] underline-offset-4 hover:text-[#087b9f] hover:underline"
                  href={link.href}
                >
                  {link.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type SocialPlatform = 'facebook' | 'telegram' | 'instagram';

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'facebook') {
    return (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 16 16">
        <path
          clipRule="evenodd"
          d="M14.6667 8C14.6667 4.318 11.682 1.33333 8 1.33333C4.318 1.33333 1.33333 4.318 1.33333 8C1.33333 11.3273 3.77133 14.0853 6.95867 14.5853V9.92733H5.26533V8H6.95867V6.53133C6.95867 4.86067 7.95333 3.938 9.47667 3.938C10.206 3.938 10.9687 4.068 10.9687 4.068V5.708H10.1287C9.3 5.708 9.042 6.222 9.042 6.74933V8H10.8907L10.5953 9.92667H9.042V14.5853C12.2287 14.0853 14.6667 11.3273 14.6667 8V8"
          fillRule="evenodd"
        />
      </svg>
    );
  }
  if (platform === 'telegram') {
    return (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 1.33333C4.32 1.33333 1.33333 4.32 1.33333 8C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8C14.6667 4.32 11.68 1.33333 8 1.33333V1.33333M11.0933 5.86667C10.9933 6.92 10.56 9.48 10.34 10.66C10.2467 11.16 10.06 11.3267 9.88667 11.3467C9.5 11.38 9.20667 11.0933 8.83333 10.8467C8.24667 10.46 7.91333 10.22 7.34667 9.84667C6.68667 9.41333 7.11333 9.17333 7.49333 8.78667C7.59333 8.68667 9.3 7.13333 9.33333 6.99333C9.34 6.97333 9.34 6.9 9.28667 6.86C9.23333 6.82 9.16 6.83333 9.10667 6.84667C9.02667 6.86 7.8 7.68 5.41333 9.30667C5.06667 9.54667 4.74667 9.66 4.46667 9.65333C4.15333 9.64667 3.55333 9.48 3.11333 9.33333C2.56667 9.15333 2.13333 9.05333 2.16667 8.74667C2.18667 8.58667 2.36 8.42667 2.69333 8.25333C4.74667 7.36 6.12667 6.76667 6.82 6.48C8.78667 5.66 9.19333 5.52 9.46 5.51333C9.52 5.51333 9.64667 5.52667 9.73333 5.58667C9.8 5.63333 9.82 5.69333 9.82667 5.74C9.84 5.8 9.84 5.86667 9.83333 5.91333L11.0933 5.86667" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 16 16">
      <path
        clipRule="evenodd"
        d="M5.13333 1.33333H10.8667C12.9653 1.33333 14.6667 3.03467 14.6667 5.13333V10.8667C14.6667 12.9653 12.9653 14.6667 10.8667 14.6667H5.13333C3.03467 14.6667 1.33333 12.9653 1.33333 10.8667V5.13333C1.33333 3.03467 3.03467 1.33333 5.13333 1.33333ZM10.8667 2.66667H5.13333C3.77133 2.66667 2.66667 3.77133 2.66667 5.13333V10.8667C2.66667 12.2287 3.77133 13.3333 5.13333 13.3333H10.8667C12.2287 13.3333 13.3333 12.2287 13.3333 10.8667V5.13333C13.3333 3.77133 12.2287 2.66667 10.8667 2.66667ZM8 4.66667C9.84095 4.66667 11.3333 6.15905 11.3333 8C11.3333 9.84095 9.84095 11.3333 8 11.3333C6.15905 11.3333 4.66667 9.84095 4.66667 8C4.66667 6.15905 6.15905 4.66667 8 4.66667ZM8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6ZM11.5 3.66667C11.9602 3.66667 12.3333 4.03976 12.3333 4.5C12.3333 4.96024 11.9602 5.33333 11.5 5.33333C11.0398 5.33333 10.6667 4.96024 10.6667 4.5C10.6667 4.03976 11.0398 3.66667 11.5 3.66667Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function SiteFooter({ branchLinks, description, linkGroups, tagline }: LandingPageContent['footer']) {
  const { language } = usePublicLanguage();
  const layoutCopy = publicUiCopy(language).layout;
  const clinicQuery = useQuery({ queryKey: queryKeys.public.clinic(), queryFn: () => getPublicClinic() });
  const contactQuery = useQuery({ queryKey: queryKeys.public.contact(), queryFn: () => getPublicContact() });
  const branchesQuery = useQuery({ queryKey: queryKeys.public.branches(language), queryFn: () => getPublicBranches(language) });
  const clinic = clinicQuery.data;
  const contact = contactQuery.data;
  const logoUrl = getPublicMediaUrl(clinic?.logoKey);
  const clinicName = language === 'km' ? clinic?.clinicNameKm : clinic?.clinicNameEn;
  const clinicTagline = language === 'km' ? clinic?.taglineKm : clinic?.taglineEn;
  const clinicDescription = language === 'km' ? clinic?.shortAboutKm : clinic?.shortAboutEn;
  const clinicFooterDescription = clinicDescription?.replace(/\\n/g, '\n').split(/\n\s*\n/)[0];
  const socialLinks = [
    { href: contact?.facebookUrl, platform: 'facebook' as const, label: 'Visit the clinic on Facebook' },
    { href: contact?.telegramUrl, platform: 'telegram' as const, label: 'Contact the clinic on Telegram' },
    { href: contact?.instagramUrl, platform: 'instagram' as const, label: 'Visit the clinic on Instagram' },
  ].filter((link): link is { href: string; platform: SocialPlatform; label: string } => Boolean(link.href));

  const queryBranchLinks = branchesQuery.data?.branches?.map((branch) => ({
    href: '/branches',
    label: branch.name,
  }));
  const effectiveBranchLinks =
    queryBranchLinks && queryBranchLinks.length > 0
      ? queryBranchLinks
      : (branchLinks ?? []);

  return (
    <footer className="border-t border-[#d9e9ee] bg-[#f7fafc] pb-8 pt-8 sm:pb-9 sm:pt-10" id="about">
      <div className="ui-page-container grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.75fr)_repeat(2,minmax(130px,0.6fr))] lg:gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          {logoUrl ? <img alt={clinicName ?? 'Clinic logo'} className="mb-3 h-11 w-auto max-w-[210px] object-contain object-left sm:h-12 sm:max-w-[250px]" src={logoUrl} /> : clinicName ? <p className="mb-3 text-xl font-extrabold text-[#087b9f]">{clinicName}</p> : null}
          {clinicTagline ?? tagline ? <p className="mb-2 text-[14px] font-bold leading-[22px] text-[#005687]">{clinicTagline ?? tagline}</p> : null}
          {clinicFooterDescription ?? description ? <p className="max-w-[285px] text-[14px] font-normal leading-6 text-[#607486]">{clinicFooterDescription ?? description}</p> : null}
          {socialLinks.length > 0 ? <div className="mt-5 flex gap-2">{socialLinks.map((link) => <a aria-label={link.label} className="grid size-11 place-items-center rounded-full border border-[#cfe4ec] bg-white text-[#168aad] transition hover:border-[#168aad] hover:bg-[#eef8fb] hover:text-[#075d83]" href={link.href} key={link.href} rel="noreferrer" target="_blank"><SocialIcon platform={link.platform} /></a>)}</div> : null}
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-extrabold leading-6 text-[#075d83]">{layoutCopy.footerBranches}</h2>
          <ul className="space-y-2.5">
            {effectiveBranchLinks.map((link) => (
            <li className="flex min-h-11 items-center gap-3 text-[#6b7280]" key={link.label}>
                <img alt="" aria-hidden="true" className="size-5 shrink-0" src={asset('branch-card-pin-alt.svg')} />
                <Link className="inline-flex min-h-11 items-center text-[14px] font-medium leading-6 text-[#607486] hover:text-[#087b9f] hover:underline hover:underline-offset-4" to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {linkGroups.map((group) => (
          <div key={group.title}>
            <FooterLinks group={group} />
          </div>
        ))}
      </div>
    </footer>
  );
}
