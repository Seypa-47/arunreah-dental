import { z } from 'zod';
import { clinicSettingsPublicReadSchema } from './clinic-settings';
import { contactSettingsPublicReadSchema } from './contact-settings';
import { imagePresentationSchema } from './image-presentation';
import { profileItemKindValues, responsibilityIconValues, teamCategoryValues } from './doctors';
import { pageMediaPlacementSchema } from './page-media';

const nullableText = z.string().nullable();
const optionalPresentation = imagePresentationSchema.optional();

export const publicServiceSummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  shortDescription: nullableText,
  listingThumbnailKey: nullableText,
  imagePresentation: optionalPresentation,
  category: nullableText,
  featured: z.boolean(),
});

const publicServiceSectionSchema = z.object({
  sectionType: z.enum(['TEXT', 'IMAGE']),
  heading: nullableText,
  body: nullableText,
  imageKey: nullableText,
  imagePresentation: optionalPresentation,
  displayOrder: z.number().int(),
});

export const publicServiceDetailSchema = publicServiceSummarySchema.extend({
  detailPresentation: z.enum([
    'STANDARD', 'JOURNEY', 'CARE_MENU', 'CLINICAL_SCOPE', 'IMAGING_GUIDE',
    'PROBLEM_TO_CARE', 'FAMILY_CARE',
  ]),
  hero: z.object({
    eyebrow: nullableText,
    title: nullableText,
    summary: nullableText,
    imageKey: nullableText,
    imagePresentation: optionalPresentation,
  }),
  about: z.object({
    title: nullableText,
    body: nullableText,
    imageKey: nullableText,
    imagePresentation: optionalPresentation,
  }),
  treatmentAtAGlance: z.object({
    duration: nullableText,
    recovery: nullableText,
    visits: nullableText,
    consultation: nullableText,
  }),
  editorial: z.object({ label: nullableText, title: nullableText }),
  benefits: z.array(z.object({ title: z.string(), description: nullableText, icon: nullableText })),
  detailSections: z.array(publicServiceSectionSchema),
  relatedServices: z.array(publicServiceSummarySchema),
  cta: z.object({
    title: nullableText,
    description: nullableText,
    primaryLabel: nullableText,
    secondaryLabel: nullableText,
  }),
  seo: z.object({ title: nullableText, description: nullableText }),
});

export const publicDoctorProfileItemSchema = z.object({
  kind: z.enum(profileItemKindValues),
  icon: z.enum(responsibilityIconValues).nullable(),
  title: z.string(),
  subtitle: nullableText,
  meta: nullableText,
  displayOrder: z.number().int(),
});

export const publicDoctorSummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  title: nullableText,
  specialty: nullableText,
  shortBio: nullableText,
  photoKey: nullableText,
  photoImagePresentation: optionalPresentation,
  featured: z.boolean(),
  category: z.enum(teamCategoryValues),
  bookable: z.boolean(),
  department: nullableText,
  teamNote: nullableText,
  profileItems: z.array(publicDoctorProfileItemSchema),
  branchIds: z.array(z.string()).optional(),
});

export const publicDoctorDetailSchema = publicDoctorSummarySchema.extend({
  about: nullableText,
  statistics: z.object({
    yearsExperience: z.number().int().nullable(),
    successfulProcedures: z.number().int().nullable(),
    patientSatisfaction: z.number().int().nullable(),
  }),
  expertise: z.array(z.object({ title: z.string(), displayOrder: z.number().int() })),
  education: z.array(z.object({
    qualification: z.string(),
    institution: z.string(),
    yearLabel: nullableText,
    displayOrder: z.number().int(),
  })),
  relatedDoctors: z.array(publicDoctorSummarySchema),
});

export const publicBranchSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  badge: nullableText,
  address: z.string(),
  cityProvince: nullableText,
  shortLocationLabel: nullableText,
  openingHours: nullableText,
  openingDays: nullableText,
  openingTime: nullableText,
  closingTime: nullableText,
  phone: z.string(),
  secondaryPhone: nullableText,
  googleMapsUrl: nullableText,
  heroImageKey: nullableText,
  branchImageKey: nullableText,
  heroImagePresentation: optionalPresentation,
  branchImagePresentation: optionalPresentation,
  heroHeadline: nullableText,
  heroSupportingText: nullableText,
  heroCtaLabel: nullableText,
  shortSummary: nullableText,
  featured: z.boolean(),
  acceptsAppointments: z.boolean(),
  showOnHomepage: z.boolean(),
  includeInHomepageHero: z.boolean(),
});

export const publicShowcaseSummarySchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  summary: nullableText,
  category: nullableText,
  coverImageKey: nullableText,
  coverImagePresentation: optionalPresentation,
  showOnHomepage: z.boolean(),
});

export const publicShowcaseDetailSchema = publicShowcaseSummarySchema.extend({
  body: nullableText,
  sections: z.array(z.object({
    sectionType: z.enum(['TEXT', 'IMAGE', 'QUOTE']),
    heading: nullableText,
    body: nullableText,
    imageKey: nullableText,
    imagePresentation: optionalPresentation,
    displayOrder: z.number().int(),
  })),
  relatedShowcases: z.array(publicShowcaseSummarySchema),
  seo: z.object({ title: nullableText, description: nullableText }),
});

export const publicPageMediaSchema = z.object({
  id: z.string().min(1),
  imageKey: z.string().min(1),
  imagePresentation: imagePresentationSchema,
  title: nullableText,
  body: nullableText,
  badge: nullableText,
  benefits: nullableText,
  discount: nullableText,
  validUntil: nullableText,
  displayOrder: z.number().int(),
});

export const publicAboutTimelineItemSchema = z.object({
  id: z.string().min(1),
  year: z.number().int(),
  title: z.string(),
  body: z.string(),
  displayOrder: z.number().int(),
});

export const appointmentAcknowledgementSchema = z.object({
  reference: z.string().min(1),
  status: z.literal('PENDING'),
  message: z.string(),
});

export const publicClinicResponseSchema = z.object({ clinic: clinicSettingsPublicReadSchema });
export const publicContactResponseSchema = z.object({ contact: contactSettingsPublicReadSchema });
export const publicServicesResponseSchema = z.object({ services: z.array(publicServiceSummarySchema) });
export const publicServiceResponseSchema = z.object({ service: publicServiceDetailSchema });
export const publicDoctorsResponseSchema = z.object({ doctors: z.array(publicDoctorSummarySchema) });
export const publicDoctorResponseSchema = z.object({ doctor: publicDoctorDetailSchema });
export const publicBranchesResponseSchema = z.object({ branches: z.array(publicBranchSchema) });
export const publicBranchResponseSchema = z.object({ branch: publicBranchSchema });
export const publicShowcasesResponseSchema = z.object({ showcases: z.array(publicShowcaseSummarySchema) });
export const publicShowcaseResponseSchema = z.object({ showcase: publicShowcaseDetailSchema });
export const publicPageMediaResponseSchema = z.object({ items: z.array(publicPageMediaSchema) });
export const publicAboutTimelineResponseSchema = z.object({ items: z.array(publicAboutTimelineItemSchema) });

export const publicSiteQuerySchema = z.object({
  lang: z.enum(['en', 'km']).default('en'),
});

export const publicSiteResponseSchema = z.object({
  site: z.object({
    clinic: clinicSettingsPublicReadSchema,
    contact: contactSettingsPublicReadSchema,
    services: z.array(publicServiceSummarySchema),
    doctors: z.array(publicDoctorSummarySchema),
    branches: z.object({
      branches: z.array(publicBranchSchema),
      landing: z.array(publicBranchSchema),
      appointments: z.array(publicBranchSchema),
    }),
    showcases: z.array(publicShowcaseSummarySchema),
    pageMedia: z.record(pageMediaPlacementSchema, z.array(publicPageMediaSchema)),
    aboutTimeline: z.array(publicAboutTimelineItemSchema),
  }),
});

export type PublicServiceSummary = z.infer<typeof publicServiceSummarySchema>;
export type PublicServiceDetail = z.infer<typeof publicServiceDetailSchema>;
export type PublicDoctorProfileItem = z.infer<typeof publicDoctorProfileItemSchema>;
export type PublicDoctorSummary = z.infer<typeof publicDoctorSummarySchema>;
export type PublicDoctorDetail = z.infer<typeof publicDoctorDetailSchema>;
export type PublicBranch = z.infer<typeof publicBranchSchema>;
export type PublicShowcaseSummary = z.infer<typeof publicShowcaseSummarySchema>;
export type PublicShowcaseDetail = z.infer<typeof publicShowcaseDetailSchema>;
export type PublicPageMedia = z.infer<typeof publicPageMediaSchema>;
export type PublicAboutTimelineItem = z.infer<typeof publicAboutTimelineItemSchema>;
export type AppointmentAcknowledgement = z.infer<typeof appointmentAcknowledgementSchema>;
export type PublicSiteSnapshot = z.infer<typeof publicSiteResponseSchema>['site'];
