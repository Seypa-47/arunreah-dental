export type LandingNavigationItem = {
  href: string;
  label: string;
};

export type LandingHero = {
  address: string;
  appointmentLabel: string;
  callLabel: string;
  imageAlt: string;
  imageUrl: string;
  locationLabel: string;
  phones: string[];
  qrImageUrl: string;
  qrLabel: string;
};

export type LandingService = {
  description: string;
  iconAlt: string;
  iconUrl: string;
  imageAlt: string;
  imageUrl: string;
  khmerName?: string;
  name: string;
};

export type LandingDoctor = {
  bookingLabel?: string;
  credential?: string;
  detail: {
    biography: string;
    education: string[];
    experience: string;
    languages: string[];
    pageDescription: string;
    profileHref: string;
    services: string[];
  };
  focus?: string;
  imageAlt: string;
  imageUrl: string;
  name: string;
  specialty: string;
};

export type LandingBranch = {
  hours: string;
  imageAlt: string;
  imageUrl: string;
  name: string;
  phones: string[];
};

export type LandingShowcase = {
  imageAlt: string;
  imageUrl: string;
  title: string;
};

export type LandingFooterLinkGroup = {
  links: LandingNavigationItem[];
  title: string;
};

export type LandingPageContent = {
  actions: {
    appointmentLabel: string;
    contactLabel: string;
  };
  branches: LandingBranch[];
  doctors: LandingDoctor[];
  footer: {
    branchLinks: LandingNavigationItem[];
    description: string;
    linkGroups: LandingFooterLinkGroup[];
    tagline: string;
  };
  heroes: LandingHero[];
  navigation: LandingNavigationItem[];
  services: LandingService[];
  showcase: LandingShowcase[];
};

export type DoctorDetailContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  doctor: LandingDoctor | undefined;
};

export type DoctorsPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  doctors: LandingDoctor[];
  hero: {
    description: string;
    title: string;
  };
};
