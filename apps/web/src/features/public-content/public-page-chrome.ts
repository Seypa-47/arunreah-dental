import type {
  AboutPageContent,
  BookAppointmentPageContent,
  BranchesPageContent,
  ContactPageContent,
  DoctorDetailContent,
  DoctorsPageContent,
  LandingNavigationItem,
  LandingPageContent,
  ServiceDetailContent,
  ServicesPageContent,
} from '@/features/landing-page/types';
import type { ClinicSettingsPublicRead } from '@arunreah/shared';
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

export function publicShell(language: 'en' | 'km' = 'en') {
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

export function publicLandingChrome(language: 'en' | 'km' = 'en'): LandingPageContent {
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

export function publicAboutContent(
  clinic: ClinicSettingsPublicRead,
  language: 'en' | 'km',
  clinicShowcase?: PublicShowcaseDetail,
  featuredDoctor?: PublicDoctorSummary,
  advancedFacilities: { id: string; imageKey: string; imagePresentation: import('@arunreah/shared').ImagePresentation; title: string | null; body: string | null; displayOrder: number }[] = [],
): AboutPageContent {
  const clinicName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
  const tagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
  const shortAbout = language === 'km' ? clinic.shortAboutKm : clinic.shortAboutEn;
  return {
    ...publicShell(language),
    clinicGallery: clinicShowcase
      ? [
          clinicShowcase.coverImageKey
            ? { imageAlt: clinicShowcase.title, imageUrl: getPublicMediaUrl(clinicShowcase.coverImageKey) ?? '' }
            : null,
          ...clinicShowcase.sections
            .filter((section) => section.sectionType === 'IMAGE' && section.imageKey)
            .map((section) => ({ imageAlt: section.heading ?? clinicShowcase.title, imageUrl: getPublicMediaUrl(section.imageKey) ?? '' })),
        ].filter((image): image is { imageAlt: string; imageUrl: string } => image !== null && Boolean(image.imageUrl))
      : [],
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
      imageUrl: '',
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

export function publicServicesChrome(language: 'en' | 'km' = 'en'): ServicesPageContent {
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

export function publicDoctorsChrome(language: 'en' | 'km' = 'en'): DoctorsPageContent {
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

export function publicServiceDetailChrome(language: 'en' | 'km' = 'en'): ServiceDetailContent {
  return { ...publicShell(language), otherServices: [], service: undefined };
}

export function publicDoctorDetailChrome(language: 'en' | 'km' = 'en'): DoctorDetailContent {
  return { ...publicShell(language), doctor: undefined, otherDoctors: [] };
}

export function publicBranchesChrome(language: 'en' | 'km' = 'en'): BranchesPageContent {
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

export function publicContactChrome(language: 'en' | 'km' = 'en'): ContactPageContent {
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

export function publicBookingChrome(language: 'en' | 'km' = 'en'): BookAppointmentPageContent {
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
