import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import type { LandingNavigationItem } from '@/features/landing-page/types';

const asset = (name: string) => `/assets/landing/${name}`;

type SiteLayoutProps = PropsWithChildren<{
  actions: {
    appointmentLabel: string;
    contactLabel: string;
  };
  navigation: LandingNavigationItem[];
}>;

export function SiteLayout({ actions, children, navigation }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#17364c]">
      <header className="relative z-40 bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-6">
          <a aria-label="Arunreah Dental Clinic home" className="shrink-0 leading-none" href="/">
            <span className="block text-[20px] font-extrabold uppercase leading-5 text-[#3696b9]">
              Arunreah
            </span>
            <span className="block text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#1789a8]">
              Dental Clinic
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
            {navigation.map((item, index) => (
              <a
                className={
                  index === 0
                    ? 'text-[14px] font-semibold leading-5 text-[#3695b9] transition hover:text-[#2299bb] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe]'
                    : 'text-[14px] font-medium leading-5 text-[#475569] transition hover:text-[#2299bb] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe]'
                }
                href={item.href}
                key={item.label}
              >
                <span className="inline-flex items-center gap-1">
                  {item.label}
                  {item.label === 'Services' ? (
                    <img alt="" aria-hidden="true" className="size-[10px]" src={asset('chevron-down.svg')} />
                  ) : null}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              className="hidden min-h-8 rounded-none border-0 border-r border-[#3696b9] bg-transparent px-0 pr-4 text-[14px] font-bold text-[#3695b9] shadow-none hover:bg-transparent hover:text-[#2a86a8] sm:inline-flex"
              icon={
                <span className="grid size-8 place-items-center rounded-full border border-[#3695b9]">
                  <img alt="" aria-hidden="true" className="size-3" src={asset('header-phone.svg')} />
                </span>
              }
              variant="secondary"
            >
              {actions.contactLabel}
            </Button>
            <Button className="min-h-9 rounded-full bg-[#3696b9] px-5 text-[14px] shadow-[0_10px_15px_-3px_#cffafe,0_4px_6px_-4px_#cffafe]">
              {actions.appointmentLabel}
            </Button>
            <div aria-label="Language selector" className="hidden items-center gap-2 pl-2 sm:flex" role="group">
              <button
                aria-label="Switch to Khmer"
                className="size-[30px] overflow-hidden rounded-full opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe]"
                type="button"
              >
                <img alt="" className="size-full object-cover" src={asset('flag-kh.png')} />
                <span className="sr-only">Khmer</span>
              </button>
              <span className="text-[12px] font-semibold leading-4 text-[#94a3b8]">|</span>
              <button
                aria-label="Switch to English"
                className="size-[30px] overflow-hidden rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe]"
                type="button"
              >
                <img alt="" className="size-full object-cover" src={asset('flag-en.png')} />
                <span className="sr-only">English</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
