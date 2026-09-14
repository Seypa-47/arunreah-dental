import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { LandingFooterLinkGroup, LandingPageContent } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicClinic, getPublicContact } from '@/services/public-content';
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

export function SiteFooter({ branchLinks, description, linkGroups, tagline }: LandingPageContent['footer']) {
  const { language } = usePublicLanguage();
  const clinicQuery = useQuery({ queryKey: queryKeys.public.clinic(), queryFn: () => getPublicClinic() });
  const contactQuery = useQuery({ queryKey: queryKeys.public.contact(), queryFn: () => getPublicContact() });
  const clinic = clinicQuery.data;
  const contact = contactQuery.data;
  const logoUrl = getPublicMediaUrl(clinic?.logoKey);
  const clinicName = language === 'km' ? clinic?.clinicNameKm : clinic?.clinicNameEn;
  const clinicTagline = language === 'km' ? clinic?.taglineKm : clinic?.taglineEn;
  const clinicDescription = language === 'km' ? clinic?.shortAboutKm : clinic?.shortAboutEn;
  const clinicFooterDescription = clinicDescription?.replace(/\\n/g, '\n').split(/\n\s*\n/)[0];
  const socialLinks = [
    { href: contact?.facebookUrl, icon: 'footer-facebook.svg', label: 'Visit the clinic on Facebook' },
    { href: contact?.telegramUrl, icon: 'footer-messenger.svg', label: 'Contact the clinic on Telegram' },
    { href: contact?.instagramUrl, icon: 'footer-instagram.svg', label: 'Visit the clinic on Instagram' },
  ].filter((link): link is { href: string; icon: string; label: string } => Boolean(link.href));
  return (
    <footer className="border-t border-[#d9e9ee] bg-[#f7fafc] pb-8 pt-8 sm:pb-9 sm:pt-10" id="about">
      <div className="ui-page-container grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.75fr)_repeat(2,minmax(130px,0.6fr))] lg:gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          {logoUrl ? <img alt={clinicName ?? 'Clinic logo'} className="mb-3 h-10 w-[190px] max-w-full object-contain object-left sm:h-11 sm:w-[220px]" src={logoUrl} /> : clinicName ? <p className="mb-3 text-xl font-extrabold text-[#087b9f]">{clinicName}</p> : null}
          {clinicTagline ?? tagline ? <p className="mb-2 text-[14px] font-bold leading-[22px] text-[#005687]">{clinicTagline ?? tagline}</p> : null}
          {clinicFooterDescription ?? description ? <p className="max-w-[285px] text-[14px] font-normal leading-6 text-[#607486]">{clinicFooterDescription ?? description}</p> : null}
          {socialLinks.length > 0 ? <div className="mt-5 flex gap-2">{socialLinks.map((link) => <a aria-label={link.label} className="grid size-9 place-items-center rounded-full border border-[#cfe4ec] bg-white transition hover:border-[#168aad] hover:bg-[#eef8fb]" href={link.href} key={link.href} rel="noreferrer" target="_blank"><img alt="" className="size-4" src={asset(link.icon)} /></a>)}</div> : null}
        </div>
        <div>
          <h2 className="mb-3 text-[15px] font-extrabold leading-6 text-[#075d83]">Our Branches</h2>
          <ul className="space-y-2.5">
            {branchLinks.map((link) => (
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
