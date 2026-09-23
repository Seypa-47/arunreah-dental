import type { FramingFrame } from './image-framing-dialog';

/**
 * Width ÷ height of every public placement, measured from the public page layouts.
 * The first frame is the main editing frame; the rest are shown as live previews.
 */
export const imageFrames = {
  branchHero: [{ aspectRatio: 2.38, label: 'Homepage hero' }, { aspectRatio: 1.07, label: 'Mobile hero' }],
  branchPhoto: [{ aspectRatio: 1.69, label: 'Branches page' }, { aspectRatio: 1.1, label: 'Homepage card' }, { aspectRatio: 1.95, label: 'Contact page' }],
  doctorPhoto: [{ aspectRatio: 1.2, label: 'Doctor card' }, { aspectRatio: 0.75, label: 'Mobile list' }, { aspectRatio: 0.94, label: 'Profile' }],
  serviceAbout: [{ aspectRatio: 2.8, label: 'Desktop' }, { aspectRatio: 1.43, label: 'Mobile' }],
  serviceCard: [{ aspectRatio: 2, label: 'Services grid' }, { aspectRatio: 1.46, label: 'Homepage card' }, { aspectRatio: 0.75, label: 'Mobile related' }],
  serviceHero: [{ aspectRatio: 1.33, label: 'Service hero' }, { aspectRatio: 1.29, label: 'Mobile' }],
  serviceSection: [{ aspectRatio: 2.25, label: 'Section card' }, { aspectRatio: 1.7, label: 'Feature block' }],
  showcaseCover: [{ aspectRatio: 1.7, label: 'Showcase card' }, { aspectRatio: 3.1, label: 'Article banner' }, { aspectRatio: 1.37, label: 'Mobile banner' }],
  showcaseSection: [{ aspectRatio: 1.84, label: 'Article image' }, { aspectRatio: 1.7, label: 'Mobile' }],
} satisfies Record<string, FramingFrame[]>;

/** Page-media placements differ per slot, so frames are chosen from the placement key. */
export function pageMediaFrames(placement: string): FramingFrame[] {
  switch (placement) {
    case 'HOME_PROMOTIONS': return [{ aspectRatio: 1.6, label: 'Promotion card' }];
    case 'ABOUT_PROFESSIONAL_DEVELOPMENT': return [{ aspectRatio: 1.86, label: 'Desktop' }, { aspectRatio: 1.43, label: 'Mobile' }];
    case 'DOCTORS_PATIENT_EDUCATION': return [{ aspectRatio: 1.85, label: 'Two-column' }, { aspectRatio: 1.14, label: 'Single item' }, { aspectRatio: 1.22, label: 'Mobile' }];
    case 'DOCTORS_HERO': return [{ aspectRatio: 2.64, label: 'Desktop hero' }, { aspectRatio: 1.07, label: 'Mobile hero' }];
    default: return [{ aspectRatio: 4 / 3, label: 'Image' }];
  }
}

const heroDesktopRatio: Record<string, number> = {
  ABOUT_HERO: 3.3, BOOKING_HERO: 4.5, BRANCHES_HERO: 3.7, CONTACT_HERO: 3.3, DOCTORS_HERO: 2.64, HOME_HERO: 2.38, SERVICES_HERO: 2.9, SHOWCASES_HERO: 2.9,
};

/** Page hero banners have a different desktop height per page; all share the tall mobile crop. */
export function pageHeroFrames(placement: string): FramingFrame[] {
  return [{ aspectRatio: heroDesktopRatio[placement] ?? 2.9, label: 'Desktop hero' }, { aspectRatio: 1.07, label: 'Mobile hero' }];
}
