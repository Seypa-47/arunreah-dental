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
      <h2 className="mb-5 text-[20px] font-semibold leading-[26px] text-[#3695b9]">{group.title}</h2>
      <ul className="space-y-3">
        {group.links.map((link) => {
          const isInternal = link.href.startsWith('/');
          return (
            <li key={link.label}>
              {isInternal ? (
                <Link
                  className="text-[14px] font-normal leading-[22px] text-[#6b7280] underline hover:text-[#3695B9]"
                  to={link.href}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  className="text-[14px] font-normal leading-[22px] text-[#6b7280] underline hover:text-[#3695B9]"
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
  const socialLinks = [
    { href: contact?.facebookUrl, icon: 'footer-facebook.svg', label: 'Visit the clinic on Facebook' },
    { href: contact?.telegramUrl, icon: 'footer-messenger.svg', label: 'Contact the clinic on Telegram' },
    { href: contact?.instagramUrl, icon: 'footer-instagram.svg', label: 'Visit the clinic on Instagram' },
  ].filter((link): link is { href: string; icon: string; label: string } => Boolean(link.href));
  return (
    <footer className="bg-white pb-12 pt-7" id="about">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:flex lg:items-start lg:justify-between lg:gap-10 lg:px-8">
        <div className="lg:w-[340px]">
          {logoUrl ? <img alt={clinicName ?? 'Clinic logo'} className="mb-4 h-auto w-[280px] max-w-full" src={logoUrl} /> : clinicName ? <p className="mb-4 text-xl font-extrabold text-[#3695b9]">{clinicName}</p> : null}
          {clinicTagline ?? tagline ? <p className="mb-2 text-[14px] font-bold leading-[22px] text-[#005687]">{clinicTagline ?? tagline}</p> : null}
          {clinicDescription ?? description ? <p className="max-w-[285px] text-[12px] font-normal leading-[22px] text-[#6b7280]">{clinicDescription ?? description}</p> : null}
          {socialLinks.length > 0 ? <div className="mt-6 flex gap-2">{socialLinks.map((link) => <a aria-label={link.label} className="grid size-6 place-items-center rounded-full bg-[#2563eb]" href={link.href} key={link.href} rel="noreferrer" target="_blank"><img alt="" className="size-3.5" src={asset(link.icon)} /></a>)}</div> : null}
        </div>
        <div className="lg:w-[220px] lg:pt-4">
          <h2 className="mb-5 text-[20px] font-semibold leading-[26px] text-[#3695B9]">Our Branches</h2>
          <ul className="space-y-3">
            {branchLinks.map((link) => (
              <li className="flex items-center gap-4 text-[#6b7280]" key={link.label}>
                <img alt="" aria-hidden="true" className="size-5 shrink-0" src={asset('branch-card-pin-alt.svg')} />
                <Link className="text-[14px] font-normal leading-[22px] hover:text-[#3695B9]" to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {linkGroups.map((group) => (
          <div className="lg:min-w-[145px] lg:pt-4" key={group.title}>
            <FooterLinks group={group} />
          </div>
        ))}
      </div>
    </footer>
  );
}
