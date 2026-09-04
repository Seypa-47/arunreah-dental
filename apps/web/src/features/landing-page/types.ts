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
    about: string[];
    biography: string;
    certifications: {
      institution: string;
      title: string;
    }[];
    education: string[];
    experience: string;
    heroSummary: string;
    languages: string[];
    pageDescription: string;
    profileHref: string;
    roleTitle: string;
    services: string[];
    stats: {
      label: string;
      value: string;
    }[];
  };
  focus?: string;
  imageAlt: string;
  imageUrl: string;
  name: string;
  profileHref?: string;
  skills?: string[];
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
  otherDoctors: LandingDoctor[];
};

export type DoctorsPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  doctors: LandingDoctor[];
  hero: {
    description: string;
    title: string;
  };
};

export type AboutPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  differences: {
    description: string;
    iconUrl: string;
    title: string;
  }[];
  facilities: {
    description: string;
    imageAlt: string;
    imageUrl: string;
    title: string;
  }[];
  hero: {
    eyebrow: string;
    imageAlt: string;
    imageUrl: string;
    subtitle: string;
    title: string;
  };
  mission: {
    description: string;
    iconUrl: string;
    title: string;
  };
  stats: {
    iconUrl: string;
    label: string;
    value: string;
  }[];
  story: {
    eyebrow: string;
    imageAlt: string;
    imageUrl: string;
    paragraphs: string[];
    title: string;
  };
  vision: {
    description: string;
    iconUrl: string;
    title: string;
  };
};

export type BranchesPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  benefits: {
    description: string;
    iconUrl: string;
    title: string;
  }[];
  branches: {
    address: string;
    badge: string;
    bookingLabel: string;
    directionsLabel: string;
    directionsUrl: string;
    hoursDays: string;
    hoursTime: string;
    imageAlt: string;
    imageUrl: string;
    mapLabel: string;
    mapUrl: string;
    mapChipEmbedded?: boolean;
    name: string;
    phoneLabel: string;
    phones: string[];
  }[];
  cta: {
    backgroundImageAlt: string;
    backgroundImageUrl: string;
    buttonLabel: string;
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  hero: {
    appointmentLabel: string;
    backgroundImageAlt: string;
    backgroundImageUrl: string;
    eyebrow: string;
    highlights: {
      iconUrl: string;
      label: string;
    }[];
    metrics: {
      description: string;
      iconUrl: string;
      label: string;
      title: string;
    }[];
    subtitle: string;
    title: string;
  };
  sections: {
    benefitsEyebrow: string;
    benefitsTitle: string;
    branchesDescription: string;
    branchesEyebrow: string;
    branchesTitle: string;
  };
};

export type ServicesPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  cta: {
    consultationLabel: string;
    contactLabel: string;
    description: string;
    title: string;
  };
  hero: {
    description: string;
    title: string;
  };
};

export type ServiceDetailContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  otherServices: LandingService[];
  service:
    | (LandingService & {
        about: {
          imageAlt: string;
          imageUrl: string;
          paragraphs: string[];
          title: string;
        };
        benefits: {
          description: string;
          icon: 'check' | 'heart' | 'shield' | 'smile' | 'star' | 'utensils';
          title: string;
        }[];
        cta: {
          appointmentLabel: string;
          contactLabel: string;
          description: string;
          title: string;
        };
        glance: {
          actionLabel: string;
          items: {
            description: string;
            icon: 'calendar' | 'clock' | 'consultation' | 'recovery';
            label: string;
          }[];
          title: string;
        };
        hero: {
          appointmentLabel: string;
          consultationLabel: string;
          eyebrow: string;
          imageAlt: string;
          imageUrl: string;
          subtitle: string;
          title: string;
        };
        slug: string;
      })
    | undefined;
};

export type ContactPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  contactCards: {
    description: string;
    icon: 'clock' | 'email' | 'location' | 'phone';
    label: string;
    value: string;
  }[];
  form: {
    branches: string[];
    fields: {
      email: string;
      fullName: string;
      message: string;
      phone: string;
      preferredBranch: string;
      preferredDate: string;
      preferredTime: string;
      service: string;
    };
    messageLimit: number;
    placeholders: {
      email: string;
      fullName: string;
      message: string;
      phone: string;
      preferredBranch: string;
      preferredDate: string;
      preferredTime: string;
      service: string;
    };
    services: string[];
    submitLabel: string;
    times: string[];
    title: string;
  };
  hero: {
    backgroundImageAlt: string;
    backgroundImageUrl: string;
    eyebrow: string;
    info: {
      description: string;
      icon: 'clock' | 'email' | 'location' | 'phone';
      label: string;
      value: string;
    }[];
    subtitle: string;
    title: string;
  };
  maps: {
    address?: string;
    badge?: string;
    directionsUrl?: string;
    hours?: string;
    imageAlt: string;
    imageUrl: string;
    label: string;
    lat?: number;
    lng?: number;
    name?: string;
    phone?: string;
    zoom?: number;
  }[];
};

export type BookAppointmentPageContent = Pick<LandingPageContent, 'actions' | 'footer' | 'navigation' | 'services'> & {
  branches: {
    address: string;
    imageAlt: string;
    imageUrl: string;
    mapLabel: string;
    mapUrl: string;
    name: string;
  }[];
  calendar: {
    dates: {
      day: number;
      disabled?: boolean;
      key: string;
      muted?: boolean;
    }[];
    monthLabel: string;
    selectedDateKey: string;
    selectedDateLabel: string;
    weekdays: string[];
  };
  doctors: {
    name: string;
    value: string;
  }[];
  form: {
    fields: {
      email: string;
      fullName: string;
      notes: string;
      phone: string;
    };
    placeholders: {
      email: string;
      fullName: string;
      notes: string;
      phone: string;
    };
    submitLabel: string;
  };
  help: {
    email: string;
    phone: string;
    title: string;
    subtitle: string;
  };
  hero: {
    backgroundImageAlt: string;
    backgroundImageUrl: string;
    subtitle: string;
    title: string;
  };
  information: string[];
  servicesList: {
    name: string;
    value: string;
  }[];
  summary: {
    duration: string;
    title: string;
  };
  times: string[];
};
