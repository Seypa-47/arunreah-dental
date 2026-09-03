import type { AdminNavIcon } from '@/services/admin-inbox';

export type ShowcaseStatus = 'published' | 'draft' | 'hidden';

export type ShowcaseCategory =
  | 'Treatment'
  | 'Patient Education'
  | 'Clinic Experience'
  | 'Smile Care';

export type ShowcaseArticle = {
  category: ShowcaseCategory;
  homepageVisibility: boolean;
  id: string;
  imageAlt: string;
  imageUrl: string;
  lastUpdatedAuthor: string;
  lastUpdatedDate: string;
  order: number;
  status: ShowcaseStatus;
  structure: {
    bodyContent: string;
    coverImage: string;
    ctaButtonCount: number;
    headline: string;
    relatedCardsCount: number;
    sectionBlocksCount: number;
    shortSummary: string;
  };
  subtitle: string;
  title: string;
};

export type AdminShowcaseContent = {
  articles: ShowcaseArticle[];
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  controls: {
    addLabel: string;
    allCategoryLabel: string;
    categories: ShowcaseCategory[];
    searchPlaceholder: string;
  };
  footer: {
    copyright: string;
    encryptionLabel: string;
    sslLabel: string;
  };
  header: {
    breadcrumb: {
      current: string;
      parent: string;
    };
    dateLabel: string;
    subtitle: string;
    title: string;
  };
  navigation: {
    icon: AdminNavIcon;
    label: string;
    section?: 'appointments' | 'services' | 'doctors';
  }[];
  table: {
    article: string;
    category: string;
    dragTip: string;
    status: string;
    title: string;
    updated: string;
    visibility: string;
  };
};

const adminShowcaseContent: AdminShowcaseContent = {
  articles: [
    {
      category: 'Treatment',
      homepageVisibility: true,
      id: 'restore-your-smile-with-dental-implants',
      imageAlt: 'Smiling mature man with healthy teeth',
      imageUrl: '/assets/landing/doctor-sreng-heng.jpg',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: 'Oct 24, 2024',
      order: 1,
      status: 'published',
      structure: {
        bodyContent:
          'Dental implants provide a foundation for replacement teeth that look, feel, and function like natural teeth. Regain the ability to eat virtually anything and smile with confidence.',
        coverImage: '/assets/landing/doctor-sreng-heng.jpg',
        ctaButtonCount: 2,
        headline: 'Restore Your Smile with Dental Implants',
        relatedCardsCount: 3,
        sectionBlocksCount: 5,
        shortSummary: 'A permanent solution for missing teeth with medical-grade titanium precision.',
      },
      subtitle: 'A permanent solution',
      title: 'Restore Your Smile with Dental Implants',
    },
    {
      category: 'Patient Education',
      homepageVisibility: true,
      id: 'caring-for-your-familys-smile-at-every-age',
      imageAlt: 'Family smiling together',
      imageUrl: '/assets/landing/showcase-family.png',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: 'Oct 22, 2024',
      order: 2,
      status: 'published',
      structure: {
        bodyContent:
          'From toddler checkups to senior dental care, maintaining lifelong healthy habits is essential for overall well-being. Learn our top preventive recommendations for each stage of life.',
        coverImage: '/assets/landing/showcase-family.png',
        ctaButtonCount: 2,
        headline: "Caring For Your Family's Smile At Every Age",
        relatedCardsCount: 3,
        sectionBlocksCount: 4,
        shortSummary: 'Personalized dental guidance designed for every generational need.',
      },
      subtitle: 'Personalized dental...',
      title: "Caring For Your Family's Smile At Every Age",
    },
    {
      category: 'Clinic Experience',
      homepageVisibility: true,
      id: 'what-to-expect-during-your-first-visit',
      imageAlt: 'Modern dental clinic treatment room',
      imageUrl: '/assets/landing/showcase-room.png',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: 'Oct 20, 2024',
      order: 3,
      status: 'published',
      structure: {
        bodyContent:
          'We believe in gentle, transparent dental visits. During your first consultation, we perform a 3D scan, thorough oral exam, and discuss your personalized treatment roadmap with zero rush.',
        coverImage: '/assets/landing/showcase-room.png',
        ctaButtonCount: 1,
        headline: 'What To Expect During Your First Visit',
        relatedCardsCount: 2,
        sectionBlocksCount: 4,
        shortSummary: 'A friendly guide to walking into our clinic and experiencing personalized care.',
      },
      subtitle: 'A friendly guide to...',
      title: 'What To Expect During Your First Visit',
    },
    {
      category: 'Smile Care',
      homepageVisibility: false,
      id: 'simple-habits-for-healthier-teeth',
      imageAlt: 'Dental hygiene products and toothbrush',
      imageUrl: '/assets/landing/showcase-toothbrush.png',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: 'Oct 18, 2024',
      order: 4,
      status: 'draft',
      structure: {
        bodyContent:
          'Simple daily modifications in brushing techniques, interdental flossing, and dietary hydration make an enormous difference in avoiding cavity accumulation and plaque build-up.',
        coverImage: '/assets/landing/showcase-toothbrush.png',
        ctaButtonCount: 2,
        headline: 'Simple Habits For Healthier Teeth',
        relatedCardsCount: 3,
        sectionBlocksCount: 3,
        shortSummary: 'Daily routines that build resilient enamel and healthy gums.',
      },
      subtitle: 'Daily routines that...',
      title: 'Simple Habits For Healthier Teeth',
    },
    {
      category: 'Treatment',
      homepageVisibility: false,
      id: 'cosmetic-dentistry-guide',
      imageAlt: 'Woman smiling with bright white teeth',
      imageUrl: '/assets/landing/service-veneer.png',
      lastUpdatedAuthor: 'Admin',
      lastUpdatedDate: 'Oct 15, 2024',
      order: 5,
      status: 'hidden',
      structure: {
        bodyContent:
          'Explore modern cosmetic dentistry options from porcelain veneers to composite bonding and laser whitening, crafted to harmonize with your facial aesthetics.',
        coverImage: '/assets/landing/service-veneer.png',
        ctaButtonCount: 2,
        headline: 'Cosmetic Dentistry Guide',
        relatedCardsCount: 3,
        sectionBlocksCount: 5,
        shortSummary: 'Explore options to enhance the balance and radiance of your smile.',
      },
      subtitle: 'Explore options to...',
      title: 'Cosmetic Dentistry Guide',
    },
  ],
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  controls: {
    addLabel: 'Add New Showcase',
    allCategoryLabel: 'All',
    categories: ['Treatment', 'Patient Education', 'Clinic Experience', 'Smile Care'],
    searchPlaceholder: 'Search showcase articles',
  },
  footer: {
    copyright: '© 2024 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    breadcrumb: {
      current: 'Management',
      parent: 'Showcase',
    },
    dateLabel: 'October 24, 2024',
    subtitle: 'Manage homepage showcase articles, visibility, and display order.',
    title: 'Latest Showcase Management',
  },
  navigation: [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'appointments', label: 'Appointments', section: 'appointments' },
    { icon: 'inbox', label: 'Inbox', section: 'appointments' },
    { icon: 'calendar', label: 'Calendar', section: 'appointments' },
    { icon: 'appointments', label: 'All Appointments', section: 'appointments' },
    { icon: 'services', label: 'Services' },
    { icon: 'doctors', label: 'Doctors' },
    { icon: 'doctors', label: 'Doctor Management', section: 'doctors' },
    { icon: 'doctors', label: 'Add New Doctor', section: 'doctors' },
    { icon: 'doctors', label: 'Specializations', section: 'doctors' },
    { icon: 'showcase', label: 'Showcase' },
    { icon: 'clinicInfo', label: 'Clinic Info' },
  ],
  table: {
    article: 'ARTICLE',
    category: 'CATEGORY',
    dragTip: 'Drag rows to reorder cards on the homepage.',
    status: 'STATUS',
    title: 'Showcase Articles',
    updated: 'LAST UPDATED',
    visibility: 'HOMEPAGE VISIBILITY',
  },
};

export async function fetchAdminShowcaseContent(): Promise<AdminShowcaseContent> {
  return adminShowcaseContent;
}
