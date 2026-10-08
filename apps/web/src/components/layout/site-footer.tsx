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
      <svg aria-hidden="true" className="size-[18px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5 21v-7.5h2.5l.375-3H13.5V8.625c0-.868.242-1.46 1.487-1.46h1.588V4.482A21.4 21.4 0 0 0 14.26 4.36c-2.29 0-3.86 1.398-3.86 3.965V10.5H7.875v3H10.4V21h3.1Z" />
      </svg>
    );
  }
  if (platform === 'telegram') {
    return (
      <svg aria-hidden="true" className="size-[18px] -translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.665 3.717 2.935 10.554c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="size-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm4.5 2.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm4.725-2.925a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25Z"
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
  const cmsFooterDescription = language === 'km' ? clinic?.footerDescriptionKm : clinic?.footerDescriptionEn;
  const clinicDescription = language === 'km' ? clinic?.shortAboutKm : clinic?.shortAboutEn;
  const fallbackSummary = clinicDescription
    ? (() => {
        const firstPara = (clinicDescription.replace(/\\n/g, '\n').split(/\n\s*\n/)[0] ?? '').trim();
        if (firstPara.length > 280) {
          const match = firstPara.match(/^([^.!?]+[.!?])/);
          if (match?.[1]) return match[1].trim();
        }
        return firstPara || undefined;
      })()
    : undefined;
  const clinicFooterDescription = cmsFooterDescription?.trim() || fallbackSummary;
  const socialLinks = [
    { href: contact?.facebookUrl, platform: 'facebook' as const, label: 'Visit the clinic on Facebook', title: 'Facebook' },
    { href: contact?.telegramUrl, platform: 'telegram' as const, label: 'Contact the clinic on Telegram', title: 'Telegram' },
    { href: contact?.instagramUrl, platform: 'instagram' as const, label: 'Visit the clinic on Instagram', title: 'Instagram' },
  ].filter((link): link is { href: string; platform: SocialPlatform; label: string; title: string } => Boolean(link.href));

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
      <div className="ui-page-container grid gap-8 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.75fr)_repeat(2,minmax(130px,0.6fr))] lg:gap-10">
        <div className="sm:col-span-3 lg:col-span-1">
          {logoUrl ? <img alt={clinicName ?? 'Clinic logo'} className="mb-3 h-11 w-auto max-w-[210px] object-contain object-left sm:h-12 sm:max-w-[250px]" src={logoUrl} /> : clinicName ? <p className="mb-3 text-xl font-extrabold text-[#087b9f]">{clinicName}</p> : null}
          {clinicTagline ?? tagline ? <p className="mb-2 text-[14px] font-bold leading-[22px] text-[#005687]">{clinicTagline ?? tagline}</p> : null}
          {clinicFooterDescription ?? description ? <p className="max-w-[460px] text-[14px] font-normal leading-6 text-[#607486] lg:max-w-[285px]">{clinicFooterDescription ?? description}</p> : null}
          {socialLinks.length > 0 ? (
            <div className="mt-5 flex items-center gap-2.5">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.label}
                  className="grid size-10 place-items-center rounded-full border border-[#cbe1ea] bg-white text-[#087b9f] shadow-[0_2px_6px_rgba(7,93,131,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#168aad] hover:bg-[#168aad] hover:text-white hover:shadow-[0_6px_14px_rgba(22,138,173,0.24)] active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168aad]"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                  title={link.title}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          ) : null}
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
