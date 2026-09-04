import type { AdminNavIcon } from '@/services/admin-inbox';
import { fetchAdminServicesContent, type AdminService } from '@/services/admin-services';
import { cmsApi } from '@/services/cms';
import { getPublicMediaUrl } from '@/services/media';

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
  service: AdminService | undefined;
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
    ],
    descriptionLabel: 'Short listing description (for services listing page card)',
    featuredLabel: 'Featured',
    imageHelp: 'Recommended: 800x600px',
    imageLabel: 'Thumbnail / Card Image',
    imageUploadLabel: 'Change Image',
    nameLabel: 'Service Name',
    sections: [
      { description: 'Heading, summary, CTA buttons, hero image', title: '2. Hero Section' },
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
  const service: AdminService = {
    id: detail.id,
    name: detail.nameEn,
    category: detail.category ?? 'Uncategorized',
    description: detail.summaryEn ?? detail.descriptionEn ?? '',
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
    service,
  };
}
