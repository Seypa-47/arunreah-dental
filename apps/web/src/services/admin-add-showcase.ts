import type { AdminNavIcon } from '@/services/admin-inbox';
import type { ShowcaseArticle, ShowcaseCategory, ShowcaseStatus } from '@/services/admin-showcase';

export type SectionBlock = {
  content: string;
  id: string;
  title: string;
};

export type RelatedShowcaseOption = {
  id: string;
  imageUrl: string;
  title: string;
};

export type NewShowcaseFormState = {
  bodyContent: string;
  cardSummary: string;
  category: ShowcaseCategory | '';
  coverImageUrl: string;
  displayOrder: number;
  headline: string;
  homepageVisibility: boolean;
  metaDescription: string;
  metaTitle: string;
  primaryCtaText: string;
  relatedShowcaseIds: string[];
  secondaryCtaText: string;
  sectionBlocks: SectionBlock[];
  shortSummary: string;
  showOnHomepage: boolean;
  slug: string;
  status: ShowcaseStatus;
  title: string;
};

export type AdminAddShowcaseContent = {
  brand: {
    logoAlt: string;
    logoUrl: string;
  };
  categories: ShowcaseCategory[];
  defaultRelatedShowcase: RelatedShowcaseOption[];
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
  quickTips: string[];
};

const adminAddShowcaseContent: AdminAddShowcaseContent = {
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
  },
  categories: ['Treatment', 'Patient Education', 'Clinic Experience', 'Smile Care'],
  defaultRelatedShowcase: [
    {
      id: 'benefits-of-dental-implants',
      imageUrl: '/assets/landing/doctor-sreng-heng.jpg',
      title: 'Benefits of Dental Implants',
    },
    {
      id: 'complete-guide-to-oral-hygiene',
      imageUrl: '/assets/landing/showcase-toothbrush.png',
      title: 'Complete Guide to Oral Hygiene',
    },
    {
      id: 'cosmetic-dentistry-transformations',
      imageUrl: '/assets/landing/service-veneer.png',
      title: 'Cosmetic Dentistry Transformations',
    },
  ],
  footer: {
    copyright: '© 2024 Arunreah Dental Clinic. All rights reserved.',
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
  },
  header: {
    breadcrumb: {
      current: 'Add New',
      parent: 'Showcase',
    },
    dateLabel: 'October 24, 2024',
    subtitle: 'Create a homepage showcase article and its public detail page content.',
    title: 'Add New Showcase',
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
  quickTips: [
    'Write clear, benefit-driven headlines.',
    'Use high-quality 16:9 ratio cover images.',
    'Keep summaries concise and engaging.',
    'Add detailed section blocks for easy reading and better engagement.',
  ],
};

export async function fetchAdminAddShowcaseContent(): Promise<AdminAddShowcaseContent> {
  return adminAddShowcaseContent;
}

export async function saveShowcaseArticle(
  formData: NewShowcaseFormState,
): Promise<ShowcaseArticle> {
  const id = formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `showcase-${Date.now()}`;

  const article: ShowcaseArticle = {
    category: (formData.category as ShowcaseCategory) || 'Treatment',
    homepageVisibility: formData.homepageVisibility,
    id,
    imageAlt: formData.title,
    imageUrl: formData.coverImageUrl || '/assets/landing/showcase-room.png',
    lastUpdatedAuthor: 'Admin',
    lastUpdatedDate: new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    order: formData.displayOrder || 1,
    status: formData.status,
    structure: {
      bodyContent: formData.bodyContent,
      coverImage: formData.coverImageUrl || '/assets/landing/showcase-room.png',
      ctaButtonCount: formData.secondaryCtaText ? 2 : 1,
      headline: formData.headline || formData.title,
      relatedCardsCount: formData.relatedShowcaseIds.length,
      sectionBlocksCount: formData.sectionBlocks.length,
      shortSummary: formData.shortSummary,
    },
    subtitle: formData.shortSummary.slice(0, 40) + '...',
    title: formData.title,
  };

  return article;
}

