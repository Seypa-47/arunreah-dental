import type { AdminNavIcon } from '@/services/admin-inbox';
import { fetchAdminServicesContent, type AdminService } from '@/services/admin-services';
import { cmsApi } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';
import type { CreateServiceInput, ImagePresentation } from '@arunreah/shared';

export type BenefitPreview = {
  icon: 'check' | 'heart' | 'shield' | 'smile' | 'star' | 'utensils';
  title: string;
};

export type AdminServiceDetailContent = {
  brand: { logoAlt: string; logoUrl: string };
  checklist: {
    column1: string[];
    column2: string[];
    items: string[];
    title: string;
  };
  controls: {
    previewLabel: string;
    saveDraftLabel: string;
    updateLabel: string;
  };
  editor: {
    basicTitle: string;
    categoryLabel: string;
    categoryOptions: string[];
    descriptionLabel: string;
    featuredLabel: string;
    imageHelp: string;
    imageLabel: string;
    imageUploadLabel: string;
    nameLabel: string;
    sections: { description: string; title: string }[];
    slugLabel: string;
    statusDraftLabel: string;
    statusLabel: string;
    statusPublishedLabel: string;
  };
  empty: { description: string; title: string };
  footer: { copyright: string; encryptionLabel: string; sslLabel: string };
  header: { breadcrumb: string[]; subtitle: string; title: string };
  navigation: { icon: AdminNavIcon; label: string; section?: 'appointments' | 'services' | 'doctors' }[];
  ordering: {
    categoryLabel: string;
    categoryOptions: string[];
    showLabel: string;
    sortLabel: string;
    title: string;
  };
  preview: {
    aboutDescription: string;
    aboutImageUrl: string;
    aboutTitle: string;
    benefits: BenefitPreview[];
    eyebrow: string;
    heroImageUrl: string;
    requestLabel: string;
    titlePrefix: string;
  };
  publishing: {
    lastUpdatedLabel: string;
    lastUpdatedValue: string;
    publishedLabel: string;
    publishedOnLabel: string;
    statusLabel: string;
    title: string;
    updatedByLabel: string;
    updatedByValue: string;
  };
  service: (AdminService & {
    benefits: CreateServiceInput['benefits'];
    detailPresentation: 'STANDARD' | 'JOURNEY' | 'CARE_MENU' | 'CLINICAL_SCOPE' | 'IMAGING_GUIDE' | 'PROBLEM_TO_CARE' | 'FAMILY_CARE';
    editorialLabelEn: string;
    editorialLabelKm: string;
    editorialTitleEn: string;
    editorialTitleKm: string;
    detailSections: CreateServiceInput['detailSections'];
    relatedServiceIds: string[];
    /** Saved values; the editor falls back to template copy only when these are empty. */
    saved: {
      aboutBodyEn: string | null;
      aboutBodyKm: string | null;
      aboutImageKey: string | null;
      aboutImagePresentation?: ImagePresentation;
      aboutTitleEn: string | null;
      aboutTitleKm: string | null;
      consultationEn: string | null;
      consultationKm: string | null;
      ctaDescriptionEn: string | null;
      ctaDescriptionKm: string | null;
      ctaTitleEn: string | null;
      ctaTitleKm: string | null;
      durationEn: string | null;
      durationKm: string | null;
      heroEyebrowEn: string | null;
      heroEyebrowKm: string | null;
      heroImageKey: string | null;
      heroImagePresentation?: ImagePresentation;
      heroSummaryEn: string | null;
      heroSummaryKm: string | null;
      heroTitleEn: string | null;
      heroTitleKm: string | null;
      imagePresentation?: ImagePresentation;
      metaDescriptionEn: string | null;
      metaDescriptionKm: string | null;
      metaTitleEn: string | null;
      metaTitleKm: string | null;
      primaryCtaLabelEn: string | null;
      primaryCtaLabelKm: string | null;
      recoveryEn: string | null;
      recoveryKm: string | null;
      secondaryCtaLabelEn: string | null;
      secondaryCtaLabelKm: string | null;
      visitsEn: string | null;
      visitsKm: string | null;
    };
  }) | undefined;
};

const adminServiceDetailLabels = {
  checklist: {
    column1: [
      'Hero section complete',
      'About section complete',
      'Treatment at a glance added',
      'Benefits section complete',
    ],
    column2: [
      'Related services selected',
      'Bottom CTA added',
      'SEO information added',
    ],
    items: [
      'Hero section complete',
      'About section complete',
      'Treatment at a glance added',
      'Benefits section complete',
      'Related services selected',
      'Bottom CTA added',
      'SEO information added',
    ],
    title: 'Content Checklist',
  },
  controls: {
    previewLabel: 'Preview Page',
    saveDraftLabel: 'Save Draft',
    updateLabel: 'Update Service',
  },
  editor: {
    basicTitle: '1. Basic Information',
    categoryLabel: 'Category',
    categoryOptions: [
      'Restorative Dentistry',
      'Cosmetic Dentistry',
      'Preventative Dentistry',
      'Specialty Dentistry',
      'Orthodontics',
      'Oral Surgery',
    ],
    descriptionLabel: 'Service description (for listing card & detail page)',
    featuredLabel: 'Featured',
    imageHelp: 'Recommended: 800x600px',
    imageLabel: 'Thumbnail / Card Image',
    imageUploadLabel: 'Change Image',
    nameLabel: 'Service Name',
    sections: [
      { description: 'Heading, summary, CTA buttons, hero image', title: '2. Hero Section' },
      { description: 'Choose the page composition, then add its bilingual label and title', title: '2a. Page Presentation' },
      { description: 'About content and supporting image', title: '3. About Section' },
      { description: 'Key facts list and CTA button', title: '4. Treatment at a Glance' },
      { description: 'Benefits intro and 6 benefit items', title: '5. Benefits Section' },
      { description: 'Select related services to display', title: '6. Related Services' },
      { description: 'Call-to-action block at the bottom', title: '7. Bottom CTA Section' },
      { description: 'Meta title, description and social image', title: '8. SEO / Meta' },
    ],
    slugLabel: 'URL Slug',
    statusDraftLabel: 'Draft',
    statusLabel: 'Status',
    statusPublishedLabel: 'Published',
  },
  empty: {
    description: 'Go back to Service Management and select a service to edit.',
    title: 'Service detail not found',
  },
  header: {
    breadcrumb: ['Services', 'Edit Service'],
    subtitle: 'Manage the content and layout for this service page.',
    title: 'Edit Service',
  },
  ordering: {
    categoryLabel: 'Related Category',
    categoryOptions: [
      'Restorative Dentistry',
      'Cosmetic Dentistry',
      'Preventative Dentistry',
      'Specialty Dentistry',
      'Orthodontics',
      'Oral Surgery',
    ],
    showLabel: 'Show in Services Listing',
    sortLabel: 'Sort Order',
    title: 'Navigation / Ordering',
  },
  preview: {
    aboutDescription: 'Dental implants are screw-like titanium posts that act as artificial tooth roots.',
    aboutImageUrl: '/assets/landing/service-implant.png',
    aboutTitle: 'About Dental Implants',
    benefits: [
      { icon: 'smile' as const, title: 'Natural Appearance' },
      { icon: 'utensils' as const, title: 'Improved Function' },
      { icon: 'shield' as const, title: 'Long-Term Solution' },
      { icon: 'check' as const, title: 'Comfortable Fit' },
      { icon: 'star' as const, title: 'Improved Confidence' },
      { icon: 'heart' as const, title: 'Supports Oral Health' },
    ],
    eyebrow: 'Dental Implants',
    heroImageUrl: '/assets/landing/service-veneer.png',
    requestLabel: 'Request Consultation',
    titlePrefix: 'Restore Your Smile with',
  },
  publishing: {
    lastUpdatedLabel: 'Last Updated',
    lastUpdatedValue: 'Oct 24, 2024 • 10:24 AM',
    publishedLabel: 'Published On',
    publishedOnLabel: 'Oct 10, 2024 • 09:00 AM',
    statusLabel: 'Status',
    title: 'Visibility & Publishing',
    updatedByLabel: 'Updated By',
    updatedByValue: 'Admin',
  },
};

export async function fetchAdminServiceDetailContent(serviceId: string | undefined): Promise<AdminServiceDetailContent> {
  const servicesContent = await fetchAdminServicesContent();
  if (!serviceId) return { ...adminServiceDetailLabels, brand: servicesContent.brand, footer: servicesContent.footer, navigation: servicesContent.navigation, service: undefined };
  const { service: detail } = await cmsApi.services.get(serviceId);
  const unifiedDescriptionEn = detail.summaryEn ?? detail.heroSummaryEn ?? detail.descriptionEn ?? '';
  const unifiedDescriptionKm = detail.summaryKm ?? detail.heroSummaryKm ?? detail.descriptionKm ?? '';
  const service: AdminService = {
    id: detail.id,
    slug: detail.slug,
    name: detail.nameEn,
    nameKm: detail.nameKm,
    category: detail.category ?? 'Uncategorized',
    description: unifiedDescriptionEn,
    descriptionKm: unifiedDescriptionKm,
    imageAlt: detail.nameEn,
    imageUrl: getPublicMediaUrl(detail.imageKey) ?? '',
    status: detail.status === 'PUBLISHED' ? 'published' : 'draft',
    featured: detail.featured,
    displayOnHomepage: detail.featured,
    order: detail.displayOrder,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };

  return {
    ...adminServiceDetailLabels,
    brand: servicesContent.brand,
    footer: servicesContent.footer,
    navigation: servicesContent.navigation,
    service: {
      ...service,
      benefits: detail.benefits ?? [],
      detailPresentation: detail.detailPresentation,
      editorialLabelEn: detail.editorialLabelEn ?? '',
      editorialLabelKm: detail.editorialLabelKm ?? '',
      editorialTitleEn: detail.editorialTitleEn ?? '',
      editorialTitleKm: detail.editorialTitleKm ?? '',
      detailSections: detail.detailSections,
      relatedServiceIds: detail.relatedServiceIds ?? [],
      saved: {
        aboutBodyEn: detail.aboutBodyEn ?? null,
        aboutBodyKm: detail.aboutBodyKm ?? null,
        aboutImageKey: detail.aboutImageKey ?? null,
        aboutImagePresentation: detail.aboutImagePresentation,
        aboutTitleEn: detail.aboutTitleEn ?? null,
        aboutTitleKm: detail.aboutTitleKm ?? null,
        consultationEn: detail.consultationEn ?? null,
        consultationKm: detail.consultationKm ?? null,
        ctaDescriptionEn: detail.ctaDescriptionEn ?? null,
        ctaDescriptionKm: detail.ctaDescriptionKm ?? null,
        ctaTitleEn: detail.ctaTitleEn ?? null,
        ctaTitleKm: detail.ctaTitleKm ?? null,
        durationEn: detail.durationEn ?? null,
        durationKm: detail.durationKm ?? null,
        heroEyebrowEn: detail.heroEyebrowEn ?? null,
        heroEyebrowKm: detail.heroEyebrowKm ?? null,
        heroImageKey: detail.heroImageKey ?? null,
        heroImagePresentation: detail.heroImagePresentation,
        heroSummaryEn: unifiedDescriptionEn || null,
        heroSummaryKm: unifiedDescriptionKm || null,
        heroTitleEn: detail.heroTitleEn ?? null,
        heroTitleKm: detail.heroTitleKm ?? null,
        imagePresentation: detail.imagePresentation,
        metaDescriptionEn: detail.metaDescriptionEn ?? null,
        metaDescriptionKm: detail.metaDescriptionKm ?? null,
        metaTitleEn: detail.metaTitleEn ?? null,
        metaTitleKm: detail.metaTitleKm ?? null,
        primaryCtaLabelEn: detail.primaryCtaLabelEn ?? null,
        primaryCtaLabelKm: detail.primaryCtaLabelKm ?? null,
        recoveryEn: detail.recoveryEn ?? null,
        recoveryKm: detail.recoveryKm ?? null,
        secondaryCtaLabelEn: detail.secondaryCtaLabelEn ?? null,
        secondaryCtaLabelKm: detail.secondaryCtaLabelKm ?? null,
        visitsEn: detail.visitsEn ?? null,
        visitsKm: detail.visitsKm ?? null,
      },
    },
  };
}
