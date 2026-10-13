import { publicSiteResponseSchema, type PublicSiteSnapshot } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { getPublicBranchList } from './branch.service';
import { getPublicClinicSettings } from './clinic-settings.service';
import { getPublicContactSettings } from './contact-settings.service';
import { getPublicDoctorList } from './doctor.service';
import { getPublicServiceList } from './service.service';
import { getPublicShowcaseList } from './showcase.service';
import * as aboutTimelineService from './about-timeline.service';
import * as pageMediaService from './page-media.service';

/**
 * Loads the shared public CMS snapshot in one Worker invocation. The underlying
 * D1 reads remain parallel, while browsers avoid issuing one HTTP request per
 * content section.
 */
export async function getPublicSiteSnapshot(
  database: DatabaseClient,
  language: 'en' | 'km',
): Promise<PublicSiteSnapshot> {
  const [
    clinic,
    contact,
    services,
    doctors,
    branches,
    landingBranches,
    appointmentBranches,
    showcases,
    pageMedia,
    aboutTimeline,
  ] = await Promise.all([
    getPublicClinicSettings(database),
    getPublicContactSettings(database),
    getPublicServiceList(database, language),
    getPublicDoctorList(database, language),
    getPublicBranchList(database, language, 'branches'),
    getPublicBranchList(database, language, 'landing'),
    getPublicBranchList(database, language, 'appointments'),
    getPublicShowcaseList(database, language),
    pageMediaService.listAllPublic(database, language),
    aboutTimelineService.listPublic(database, language),
  ]);

  return publicSiteResponseSchema.parse({
    site: {
      clinic,
      contact,
      services,
      doctors,
      branches: {
        branches,
        landing: landingBranches,
        appointments: appointmentBranches,
      },
      showcases,
      pageMedia,
      aboutTimeline: aboutTimeline.items,
    },
  }).site;
}
