import type { LandingFooterLinkGroup, LandingPageContent } from '@/features/landing-page/types';

const asset = (name: string) => `/assets/landing/${name}`;

function FooterLinks({ group }: { group: LandingFooterLinkGroup }) {
  return (
    <div>
      <h2 className="mb-6 text-[24px] font-semibold leading-[31px] text-[#3695b9]">{group.title}</h2>
      <ul className="space-y-4">
        {group.links.map((link) => (
          <li key={link.label}>
            <a className="text-[16px] font-normal leading-[26px] text-[#3c494c] underline hover:text-[#209cc2]" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ branchLinks, description, linkGroups, tagline }: LandingPageContent['footer']) {
  return (
    <footer className="bg-white pb-[60px] pt-[35px]" id="about">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[585px_216px_145px_1fr] lg:gap-14 lg:px-[58px]">
        <div>
          <img
            alt="Arunreah Dental Clinic"
            className="mb-[17px] h-auto w-[337px] max-w-full"
            src={asset('footer-logo-cropped.png')}
          />
          <p className="mb-2 text-[16px] font-bold leading-[26px] text-[#3c494c]">{tagline}</p>
          <p className="max-w-[315px] text-[13px] font-normal leading-[26px] text-[#3c494c]">{description}</p>
          <div className="mt-8 flex gap-2">
            <a
              aria-label="Visit Arunreah Dental Clinic on Facebook"
              className="grid size-7 place-items-center rounded-full bg-[#2563eb]"
              href="https://www.facebook.com/"
            >
              <img alt="" className="size-4" src={asset('footer-facebook.svg')} />
            </a>
            <a
              aria-label="Contact Arunreah Dental Clinic on Messenger"
              className="grid size-7 place-items-center rounded-full bg-[#08c]"
              href="https://www.messenger.com/"
            >
              <img alt="" className="size-4" src={asset('footer-messenger.svg')} />
            </a>
          </div>
        </div>
        <div className="lg:pt-[18px]">
          <h2 className="mb-6 text-[24px] font-semibold leading-[31px] text-[#3695b9]">Our Branches</h2>
          <ul className="space-y-4">
            {branchLinks.map((link) => (
              <li className="flex items-center gap-5 text-[#3c494c]" key={link.label}>
                <img alt="" aria-hidden="true" className="size-6 shrink-0" src={asset('branch-card-pin-alt.svg')} />
                <a className="text-[16px] font-normal leading-[26px] hover:text-[#209cc2]" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {linkGroups.map((group) => (
          <div className="lg:pt-[18px]" key={group.title}>
            <FooterLinks group={group} />
          </div>
        ))}
      </div>
    </footer>
  );
}
