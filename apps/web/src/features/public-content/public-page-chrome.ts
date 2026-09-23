import type {
  AboutPageContent,
  BookAppointmentPageContent,
  BranchesPageContent,
  ClinicBranchGallery,
  ContactPageContent,
  DoctorDetailContent,
  DoctorsPageContent,
  LandingNavigationItem,
  LandingPageContent,
  ServiceDetailContent,
  ServicesPageContent,
} from '@/features/landing-page/types';
import type { ClinicSettingsPublicRead, PublicBranchRead } from '@arunreah/shared';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicDoctorSummary, PublicShowcaseDetail } from '@/services/public-content';

// These values are interface copy and layout configuration. CMS-owned records
// (clinic, contact, services, doctors, branches, showcases and images) are
export const skeletonNavigation: LandingNavigationItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
  { href: '/showcases', label: 'Showcases' },
];

export function publicShell(language: 'en' | 'km') {
  const isKm = language === 'km';
  return {
    actions: {
      appointmentLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
      contactLabel: isKm ? 'ទាក់ទងយើង' : 'Contact Us',
    },
    footer: {
      branchLinks: [],
      description: '',
      linkGroups: [
        {
          title: isKm ? 'ស្វែងរក' : 'Explore',
          links: [
            { href: '/services', label: isKm ? 'សេវាកម្ម' : 'Services' },
            { href: '/doctors', label: isKm ? 'វេជ្ជបណ្ឌិត' : 'Doctors' },
            { href: '/branches', label: isKm ? 'សាខា' : 'Locations' },
          ],
        },
        {
          title: isKm ? 'ទំនាក់ទំនង' : 'Contact',
          links: [
            { href: '/contact', label: isKm ? 'ទាក់ទងយើង' : 'Contact Us' },
            { href: '/book-appointment', label: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment' },
          ],
        },
      ],
      tagline: '',
    },
    navigation: [
      { href: '/', label: isKm ? 'ទំព័រដើម' : 'Home' },
      { href: '/about', label: isKm ? 'អំពីយើង' : 'About' },
      { href: '/services', label: isKm ? 'សេវាកម្ម' : 'Services' },
      { href: '/doctors', label: isKm ? 'វេជ្ជបណ្ឌិត' : 'Doctors' },
      { href: '/branches', label: isKm ? 'សាខា' : 'Branches' },
      { href: '/showcases', label: isKm ? 'ស្នាដៃ' : 'Showcases' },
    ],
    services: [],
  };
}

export function publicLandingChrome(language: 'en' | 'km'): LandingPageContent {
  return {
    ...publicShell(language),
    branches: [],
    branchesEditorial: language === 'km'
      ? { eyebrow: 'សាខារបស់យើង' }
      : { eyebrow: 'Our locations' },
    doctors: [],
    heroes: [],
    promotions: [],
    promotionsEditorial: language === 'km'
      ? { eyebrow: 'ព័ត៌មាន និងកម្មវិធីពិសេស', subtitle: 'ស្វែងយល់អំពីកម្មវិធី និងព័ត៌មានថ្មីៗពីគ្លីនិករបស់យើង។', title: 'កម្មវិធីពិសេសពីគ្លីនិក' }
      : { eyebrow: 'News and special offers', subtitle: 'Explore current clinic campaigns and helpful updates from our care team.', title: 'Clinic promotions' },
    showcase: [],
  };
}

function extractShowcaseGallery(
  showcase?: PublicShowcaseDetail,
  fallbackTitle = '',
  fallbackImages?: { imageAlt: string; imageUrl: string }[],
): { imageAlt: string; imagePresentation?: import('@arunreah/shared').ImagePresentation; imageUrl: string }[] {
  if (showcase) {
    const list: { imageAlt: string; imagePresentation?: import('@arunreah/shared').ImagePresentation; imageUrl: string }[] = [];
    if (showcase.coverImageKey) {
      const url = getPublicMediaUrl(showcase.coverImageKey) ?? (showcase.coverImageKey.startsWith('http') || showcase.coverImageKey.startsWith('/') ? showcase.coverImageKey : `/assets/landing/${showcase.coverImageKey}`);
      if (url) {
        list.push({
          imageAlt: showcase.title || fallbackTitle,
          imagePresentation: showcase.coverImagePresentation,
          imageUrl: url,
        });
      }
    }
    for (const section of showcase.sections) {
      if (section.sectionType === 'IMAGE' && section.imageKey) {
        const url = getPublicMediaUrl(section.imageKey) ?? (section.imageKey.startsWith('http') || section.imageKey.startsWith('/') ? section.imageKey : `/assets/landing/${section.imageKey}`);
        if (url) {
          list.push({
            imageAlt: section.heading ?? showcase.title ?? fallbackTitle,
            imagePresentation: section.imagePresentation,
            imageUrl: url,
          });
        }
      }
    }
    if (list.length > 0) return list;
  }
  return fallbackImages ?? [];
}

export function publicAboutContent(
  clinic: ClinicSettingsPublicRead,
  language: 'en' | 'km',
  clinicShowcase?: PublicShowcaseDetail,
  featuredDoctor?: PublicDoctorSummary,
  advancedFacilities: { id: string; imageKey: string; imagePresentation: import('@arunreah/shared').ImagePresentation; title: string | null; body: string | null; displayOrder: number }[] = [],
  branches: (PublicBranchRead | import('@/services/public-content').PublicBranch)[] = [],
  branchShowcases?: { psaChas?: PublicShowcaseDetail; toulTompoung?: PublicShowcaseDetail },
): AboutPageContent {
  const clinicName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
  const tagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
  const shortAbout = language === 'km' ? clinic.shortAboutKm : clinic.shortAboutEn;

  const defaultPsaChasImages = [
    { imageAlt: language === 'km' ? 'សាខាផ្សារចាស់' : 'Psa Chas Branch', imageUrl: '/assets/landing/psa-chas-exterior.jpg' },
    { imageAlt: language === 'km' ? 'ការិយាល័យទទួលភ្ញៀវ' : 'Our reception', imageUrl: '/assets/landing/psa-chas-reception.jpg' },
    { imageAlt: language === 'km' ? 'កន្លែងរង់ចាំប្រកបដោយផាសុកភាព' : 'Comfortable waiting lounge', imageUrl: '/assets/landing/psa-chas-waiting-area.jpg' },
    { imageAlt: language === 'km' ? 'កន្លែងពិគ្រោះយោបល់ និងសម្រាកលំហែ' : 'Consultation and lounge area', imageUrl: '/assets/landing/psa-chas-consultation-lounge.jpg' },
  ];

  const defaultToulTompoungImages = [
    { imageAlt: language === 'km' ? 'សាខាទួលទំពូង' : 'Toul Tompoung Branch', imageUrl: '/assets/landing/branches-clinic.png' },
    { imageAlt: language === 'km' ? 'ការិយាល័យទទួលភ្ញៀវ' : 'Our reception', imageUrl: '/assets/landing/hero-clinic.png' },
    { imageAlt: language === 'km' ? 'កន្លែងរង់ចាំ' : 'Comfortable waiting area', imageUrl: '/assets/landing/showcase-room.png' },
    { imageAlt: language === 'km' ? 'បន្ទប់ព្យាបាល' : 'A calm clinic environment', imageUrl: '/assets/landing/branch-card-clinic.png' },
  ];

  const psaChasBranch = branches.find((b) => b.slug === 'psa-chas');
  const psaChasGallery = extractShowcaseGallery(
    branchShowcases?.psaChas,
    language === 'km' ? 'សាខាផ្សារចាស់' : 'Psa Chas Branch',
    defaultPsaChasImages,
  );

  const toulTompoungBranch = branches.find((b) => b.slug === 'toul-tompoung');
  const toulTompoungGallery = extractShowcaseGallery(
    branchShowcases?.toulTompoung ?? clinicShowcase,
    language === 'km' ? 'សាខាទួលទំពូង' : 'Toul Tompoung Branch',
    defaultToulTompoungImages,
  );

  const branchGalleries: ClinicBranchGallery[] = [
    {
      branchId: psaChasBranch?.id ?? 'psa-chas',
      branchSlug: 'psa-chas',
      branchName: psaChasBranch?.name ?? (language === 'km' ? 'សាខាផ្សារចាស់' : 'Psa Chas Branch'),
      badge: psaChasBranch?.badge ?? (language === 'km' ? 'សាខាក្នុងក្រុង' : 'City Branch'),
      shortLocationLabel: psaChasBranch?.shortLocationLabel ?? (language === 'km' ? 'ជិតផ្សារចាស់ រាជធានីភ្នំពេញ' : 'Near Old Market, Phnom Penh'),
      address: psaChasBranch?.address ?? (language === 'km' ? '#៤៥ ផ្លូវលេខ ១៣ សង្កាត់វត្តភ្នំ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ កម្ពុជា (ជិតផ្សារចាស់)' : '#45, Street 13, Sangkat Wat Phnom, Khan Daun Penh, Phnom Penh, Cambodia (Near Old Market)'),
      openingHours: psaChasBranch?.openingHours ?? (language === 'km' ? 'ច័ន្ទ - អាទិត្យ៖ ៨:០០ ព្រឹក - ៧:០០ ល្ងាច' : 'Monday - Sunday: 8:00 AM - 7:00 PM'),
      phone: psaChasBranch?.phone ?? '069 978 997',
      googleMapsUrl: psaChasBranch?.googleMapsUrl ?? 'https://maps.app.goo.gl/M5gvtMWpzYydHM2v5',
      showcaseTitle: branchShowcases?.psaChas?.title ?? (language === 'km' ? 'អ្វីដែលត្រូវរំពឹងក្នុងការមកពិនិត្យលើកដំបូង - សាខាផ្សារចាស់' : 'What To Expect During Your First Visit - Psa Chas Branch'),
      images: psaChasGallery,
    },
    {
      branchId: toulTompoungBranch?.id ?? 'toul-tompoung',
      branchSlug: 'toul-tompoung',
      branchName: toulTompoungBranch?.name ?? (language === 'km' ? 'សាខាទួលទំពូង' : 'Toul Tompoung Branch'),
      badge: toulTompoungBranch?.badge ?? (language === 'km' ? 'សាខាចម្បង' : 'Main Branch'),
      shortLocationLabel: toulTompoungBranch?.shortLocationLabel ?? (language === 'km' ? 'ទួលទំពូង រាជធានីភ្នំពេញ' : 'Toul Tompoung, Phnom Penh'),
      address: toulTompoungBranch?.address ?? (language === 'km' ? 'ផ្ទះ159c ផ្លូវ 113 ភូមិ 4 សង្កាត់បឹងកេងកង3 ខណ្ឌបឹងកេងកង' : '#159c, st113, Boeng Keng Kang 3, Phnom Penh'),
      openingHours: toulTompoungBranch?.openingHours ?? (language === 'km' ? 'ច័ន្ទ - អាទិត្យ៖ ៨:០០ ព្រឹក - ៧:០០ ល្ងាច' : 'Monday - Sunday: 8:00 AM - 7:00 PM'),
      phone: toulTompoungBranch?.phone ?? '061 978 997',
      googleMapsUrl: toulTompoungBranch?.googleMapsUrl ?? 'https://maps.app.goo.gl/LHQeXEkpcAvcfnT18',
      showcaseTitle: (branchShowcases?.toulTompoung ?? clinicShowcase)?.title ?? (language === 'km' ? 'អ្វីដែលត្រូវរំពឹងក្នុងការមកពិនិត្យលើកដំបូង - សាខាទួលទំពូង' : 'What To Expect During Your First Visit - Toul Tompoung Branch'),
      images: toulTompoungGallery,
    },
  ];

  return {
    ...publicShell(language),
    branchGalleries,
    clinicGallery: psaChasGallery.length > 0 ? psaChasGallery : toulTompoungGallery,
    editorial: language === 'km'
      ? {
          editionLabel: 'ព័ត៌មានគ្លីនិក',
          galleryEyebrow: 'បរិយាកាសគ្លីនិក',
          galleryTitle: 'ទិដ្ឋភាពនៅក្នុងគ្លីនិករបស់យើង',
          professionalEyebrow: 'ការអភិវឌ្ឍវិជ្ជាជីវៈ',
          professionalTitle: 'រៀនដើម្បីថែទាំអ្នកបានកាន់តែប្រសើរ',
          facilitiesEyebrow: 'បច្ចេកវិទ្យាក្នុងគ្លីនិក',
          facilitiesTitle: 'គ្រឿងបរិក្ខារទំនើប សម្រាប់ការថែទាំដោយយកចិត្តទុកដាក់',
          timelineEyebrow: 'ប្រវត្តិនៃការរីកចម្រើន',
          timelineTitle: 'ដំណើរឆ្ពោះទៅមុខរបស់យើង',
          profileLabel: 'ជួបជាមួយក្រុមការងារ',
          profileTitle: 'ការថែទាំដែលចាប់ផ្តើមពីការស្តាប់',
        }
      : {
          editionLabel: 'Clinic profile',
          galleryEyebrow: 'Inside our clinic',
          galleryTitle: 'A look inside our clinic',
          professionalEyebrow: 'Professional development',
          professionalTitle: 'Learning to care better',
          facilitiesEyebrow: 'Clinic technology',
          facilitiesTitle: 'Advanced facilities for considered care',
          timelineEyebrow: 'Our journey',
          timelineTitle: 'Growing with our community',
          profileLabel: 'Meet the team',
          profileTitle: 'Care that starts with listening',
        },
    featuredDoctor: featuredDoctor
      ? {
          imageAlt: featuredDoctor.name,
          imageUrl: getPublicMediaUrl(featuredDoctor.photoKey) ?? '',
          name: featuredDoctor.name,
          profileHref: `/doctors/${featuredDoctor.slug}`,
          specialty: featuredDoctor.specialty ?? '',
          summary: featuredDoctor.shortBio ?? '',
          title: featuredDoctor.title ?? '',
        }
      : undefined,
    differences: [],
    facilities: advancedFacilities
      .map((item) => ({
        description: item.body ?? '',
        imageAlt: item.title ?? (language === 'km' ? 'គ្រឿងបរិក្ខារទំនើបនៅគ្លីនិក' : 'Advanced dental facility'),
        imageUrl: getPublicMediaUrl(item.imageKey) ?? '',
        imagePresentation: item.imagePresentation,
        title: item.title ?? '',
      }))
      .filter((facility) => Boolean(facility.imageUrl)),
    hero: {
      eyebrow: language === 'km' ? 'អំពីយើង' : 'ABOUT US',
      imageAlt: clinicName,
      imageUrl: '/assets/landing/figma-branches/image2_183_4173.png',
      subtitle: tagline ?? (language === 'km' ? 'ការថែទាំធ្មេញដោយយកចិត្តទុកដាក់ ដើម្បីស្នាមញញឹមមានសុខភាពល្អ និងទំនុកចិត្ត។' : 'Thoughtful dental care for a healthier, more confident smile.'),
      title: language === 'km' ? 'អំពី គ្លីនិកធ្មេញ អរុណរះ' : 'About Arunreah Dental Clinic',
    },
    mission: { description: '', iconUrl: '', title: '' },
    stats: [
      {
        iconUrl: '/assets/landing/about-stat-experience.svg',
        label: language === 'km' ? 'ឆ្នាំនៃបទពិសោធន៍' : 'Years of experience',
        value: String(clinic.yearsExperience ?? 26),
      },
    ],
    story: { eyebrow: '', imageAlt: '', imageUrl: '', paragraphs: shortAbout ? shortAbout.replace(/\\n/g, '\n').split(/\n{2,}/).filter(Boolean) : [], title: clinicName },
    vision: { description: '', iconUrl: '', title: '' },
  };
}

export function publicServicesChrome(language: 'en' | 'km'): ServicesPageContent {
  const isKm = language === 'km';
  return {
    ...publicShell(language),
    cta: {
      consultationLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
      contactLabel: isKm ? 'ទាក់ទងយើង' : 'Contact Us',
      description: isKm ? 'ពិភាក្សាជាមួយក្រុមការងារគ្លីនិករបស់យើងអំពីការព្យាបាលដែលសមស្របសម្រាប់អ្នក។' : 'Talk with our clinic team about the care that is right for you.',
      title: isKm ? 'តើអ្នកត្រៀមខ្លួនរួចរាល់ហើយឬនៅ?' : 'Ready to take the next step?',
    },
    hero: {
      description: isKm ? 'ស្វែងយល់ពីសេវាកម្មព្យាបាលធ្មេញដែលមាននៅគ្លីនិករបស់យើង។' : 'Explore the treatments currently offered by our clinic.',
      title: isKm ? 'សេវាកម្មរបស់យើង' : 'Our Services',
    },
  };
}

export function publicDoctorsChrome(language: 'en' | 'km'): DoctorsPageContent {
  const isKm = language === 'km';
  return {
    ...publicShell(language),
    doctors: [],
    hero: {
      description: isKm ? 'ជួបជាមួយក្រុមទន្តបណ្ឌិតឯកទេសរបស់យើង។' : 'Meet our clinic professionals.',
      title: isKm ? 'ទន្តបណ្ឌិតឯកទេស' : 'Our Specialists',
    },
  };
}

export function publicServiceDetailChrome(language: 'en' | 'km'): ServiceDetailContent {
  return { ...publicShell(language), otherServices: [], service: undefined };
}

export function publicDoctorDetailChrome(language: 'en' | 'km'): DoctorDetailContent {
  return { ...publicShell(language), doctor: undefined, otherDoctors: [] };
}

export function publicBranchesChrome(language: 'en' | 'km'): BranchesPageContent {
  const isKm = language === 'km';
  return {
    ...publicShell(language),
    benefits: [],
    branches: [],
    cta: {
      backgroundImageAlt: '',
      backgroundImageUrl: '',
      buttonLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
      eyebrow: '',
      subtitle: isKm ? 'ជ្រើសរើសសាខា និងផ្ញើសំណើណាត់ជួបរបស់អ្នក។' : 'Choose a branch and send an appointment request.',
      title: isKm ? 'មកកាន់ គ្លីនិកធ្មេញ អារុណរះ' : 'Visit Arunreah Dental Clinic',
    },
    hero: {
      appointmentLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
      backgroundImageAlt: '',
      backgroundImageUrl: '',
      eyebrow: '',
      highlights: [],
      metrics: [],
      subtitle: isKm ? 'ស្វែងរកសាខាគ្លីនិកដែលសមស្របសម្រាប់អ្នក។' : 'Find a clinic branch that works for you.',
      title: isKm ? 'ទីតាំងរបស់យើង' : 'Our Locations',
    },
    sections: {
      benefitsEyebrow: '',
      benefitsTitle: '',
      branchesDescription: '',
      branchesEyebrow: '',
      branchesTitle: isKm ? 'ទីតាំងគ្លីនិក' : 'Clinic Locations',
    },
  };
}

export function publicContactChrome(language: 'en' | 'km'): ContactPageContent {
  const isKm = language === 'km';
  return {
    ...publicShell(language),
    contactCards: [],
    form: {
      branches: [],
      fields: {
        email: isKm ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Address',
        fullName: isKm ? 'ឈ្មោះពេញ' : 'Full Name',
        message: isKm ? 'សារ' : 'Message',
        phone: isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number',
        preferredBranch: isKm ? 'សាខាដែលពេញចិត្ត' : 'Preferred Branch',
        preferredDate: isKm ? 'កាលបរិច្ឆេទដែលពេញចិត្ត' : 'Preferred Date',
        preferredTime: isKm ? 'ពេលវេលាដែលពេញចិត្ត' : 'Preferred Time',
        service: isKm ? 'សេវាកម្ម' : 'Service',
      },
      messageLimit: 1000,
      placeholders: {
        email: isKm ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក' : 'Enter your email address',
        fullName: isKm ? 'បញ្ចូលឈ្មោះរបស់អ្នក' : 'Enter your name',
        message: isKm ? 'ប្រាប់យើងពីអ្វីដែលយើងអាចជួយបាន' : 'Tell us how we can help',
        phone: isKm ? 'បញ្ចូលលេខទូរស័ព្ទរបស់អ្នក' : 'Enter your phone number',
        preferredBranch: isKm ? 'ជ្រើសរើសសាខា' : 'Select a branch',
        preferredDate: isKm ? 'ជ្រើសរើសថ្ងៃ' : 'Select date',
        preferredTime: isKm ? 'ជ្រើសរើសម៉ោង' : 'Select time',
        service: isKm ? 'ជ្រើសរើសសេវាកម្ម' : 'Select a service',
      },
      services: [],
      submitLabel: isKm ? 'ផ្ញើសំណួរ' : 'Send Inquiry',
      times: [],
      title: isKm ? 'ផ្ញើសារមកកាន់យើង' : 'Send Us a Message',
    },
    hero: {
      backgroundImageAlt: '',
      backgroundImageUrl: '',
      eyebrow: isKm ? 'ទំនាក់ទំនង' : 'Get In Touch',
      info: [],
      subtitle: isKm ? 'ទាក់ទងមកកាន់ក្រុមការងារគ្លីនិករបស់យើងសម្រាប់ការជួយសម្រួលដល់ការព្យាបាលរបស់អ្នក។' : 'Contact our clinic team for help with your care.',
      title: isKm ? 'ទាក់ទងមកយើង' : 'Contact Us',
    },
    maps: [],
  };
}

export function publicBookingChrome(language: 'en' | 'km'): BookAppointmentPageContent {
  const isKm = language === 'km';
  return {
    ...publicShell(language),
    branches: [],
    calendar: { dates: [], monthLabel: '', selectedDateKey: '', selectedDateLabel: '', weekdays: [] },
    doctors: [],
    form: {
      fields: {
        email: isKm ? 'អាសយដ្ឋានអ៊ីមែល' : 'Email Address',
        fullName: isKm ? 'ឈ្មោះពេញ' : 'Full Name',
        notes: isKm ? 'ចំណាំបន្ថែម (ស្រេចចិត្ត)' : 'Additional Notes (Optional)',
        phone: isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number',
      },
      placeholders: {
        email: isKm ? 'បញ្ចូលអ៊ីមែលរបស់អ្នក' : 'Enter your email address',
        fullName: isKm ? 'បញ្ចូលឈ្មោះពេញរបស់អ្នក' : 'Enter your full name',
        notes: isKm ? 'ប្រាប់យើងបន្ថែមពីបញ្ហារបស់អ្នក' : 'Tell us more about your concern',
        phone: isKm ? 'បញ្ចូលលេខទូរស័ព្ទរបស់អ្នក' : 'Enter your phone number',
      },
      submitLabel: isKm ? 'ផ្ញើសំណើណាត់ជួប' : 'Send Appointment Request',
    },
    help: {
      email: '',
      phone: '',
      subtitle: isKm ? 'ក្រុមការងាររបស់យើងត្រៀមខ្លួនជាស្រេចក្នុងការជួយអ្នក។' : 'Our team is ready to assist you.',
      title: isKm ? 'ត្រូវការជំនួយ?' : 'Need Help?',
    },
    hero: {
      backgroundImageAlt: '',
      backgroundImageUrl: '',
      subtitle: isKm ? 'ផ្ញើសំណើណាត់ជួបដែលអ្នកពេញចិត្ត ហើយគ្លីនិករបស់យើងនឹងពិនិត្យមើល។' : 'Send a preferred appointment request and our clinic will review it.',
      title: isKm ? 'កក់ការណាត់ជួប' : 'Book an Appointment',
    },
    information: [],
    servicesList: [],
    summary: {
      duration: '',
      title: isKm ? 'សង្ខេបការណាត់ជួប' : 'Appointment Summary',
    },
    times: [],
  };
}
