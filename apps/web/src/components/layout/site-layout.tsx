import { useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { LandingNavigationItem, LandingService } from '@/features/landing-page/types';

const asset = (name: string) => `/assets/landing/${name}`;
const serviceAnchor = (name: string) => `/#service-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')}`;

type SiteLayoutProps = PropsWithChildren<{
  actions: {
    appointmentLabel: string;
    contactLabel: string;
  };
  navigation: LandingNavigationItem[];
  services?: Pick<LandingService, 'name'>[];
}>;

export function SiteLayout({ actions, children, navigation, services = [] }: SiteLayoutProps) {
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'km'>('en');
  const { hash, pathname } = useLocation();

  const isActiveNavigationItem = (item: LandingNavigationItem) => {
    if (item.href.startsWith('/doctors')) {
      return pathname.startsWith('/doctors');
    }

    if (item.href === '/') {
      return pathname === '/' && !hash;
    }

    if (item.href.includes('#')) {
      return pathname === '/' && hash === item.href.slice(item.href.indexOf('#'));
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] text-[#17364c]">
      <header className="relative z-40 bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a aria-label="Arunreah Dental Clinic home" className="shrink-0 leading-none" href="/">
            <span className="block text-[20px] font-extrabold uppercase leading-5 tracking-[-0.25px] text-[#3696b9]">
              Arunreah
            </span>
            <span className="block text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#1789a8]">
              Dental Clinic
            </span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => {
              const isActive = isActiveNavigationItem(item);
              const linkClass =
                isActive
                  ? 'text-[14px] font-semibold leading-5 tracking-[0.4px] text-[#3695b9] transition hover:text-[#2299bb] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe]'
                  : 'text-[14px] font-medium leading-5 text-[#475569] transition hover:text-[#2299bb] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe]';

              if (item.label !== 'Services') {
                return (
                  <a aria-current={isActive ? 'page' : undefined} className={linkClass} href={item.href} key={item.label}>
                    {item.label}
                  </a>
                );
              }

              return (
                <div className="group relative" key={item.label}>
                  <a className={linkClass} href={item.href}>
                    <span className="inline-flex items-center gap-1">
                      {item.label}
                      <img alt="" aria-hidden="true" className="size-[10px]" src={asset('chevron-down.svg')} />
                    </span>
                  </a>
                  <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-[282px] -translate-x-1/2 rounded-2xl border border-[#e7eef2] bg-white p-2 opacity-0 shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="absolute -top-4 left-0 h-4 w-full" />
                    {services.map((service) => (
                      <a
                        className="block rounded-xl px-4 py-3 text-[14px] font-medium leading-5 text-[#475569] transition hover:bg-[#f0f9fa] hover:text-[#005687] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9]"
                        href={serviceAnchor(service.name)}
                        key={service.name}
                      >
                        {service.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button
              className="hidden h-9 min-h-9 rounded-none border-0 border-r border-[#3696b9] bg-transparent px-0 py-0 pr-4 text-[14px] font-bold text-[#3695b9] shadow-none hover:bg-transparent hover:text-[#2a86a8] sm:inline-flex"
              icon={
                <span className="grid size-8 place-items-center rounded-full border border-[#3695b9]">
                  <img alt="" aria-hidden="true" className="size-3" src={asset('header-phone.svg')} />
                </span>
              }
              variant="secondary"
            >
              {actions.contactLabel}
            </Button>
            <Button className="h-9 min-h-9 rounded-full bg-[#3696b9] px-5 py-0 text-[14px] font-bold shadow-[0_10px_15px_-3px_#cffafe,0_4px_6px_-4px_#cffafe] hover:bg-[#2f8fb0]">
              {actions.appointmentLabel}
            </Button>
            <div aria-label="Language selector" className="hidden items-center gap-2 pl-2 sm:flex" role="group">
              <button
                aria-label="Switch to Khmer"
                aria-pressed={activeLanguage === 'km'}
                className={`size-[30px] overflow-hidden rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe] ${
                  activeLanguage === 'km' ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => setActiveLanguage('km')}
                type="button"
              >
                <img alt="" className="size-full object-cover" src={asset('flag-kh.png')} />
                <span className="sr-only">Khmer</span>
              </button>
              <span className="text-[12px] font-semibold leading-4 text-[#94a3b8]">|</span>
              <button
                aria-label="Switch to English"
                aria-pressed={activeLanguage === 'en'}
                className={`size-[30px] overflow-hidden rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f9fbe] ${
                  activeLanguage === 'en' ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => setActiveLanguage('en')}
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
