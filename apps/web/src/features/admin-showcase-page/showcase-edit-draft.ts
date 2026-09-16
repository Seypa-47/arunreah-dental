import type { UpdateShowcaseInput } from '@arunreah/shared';
import type { AdminShowcaseDetail } from '@/services/cms';

/** The persisted subset of the Showcase editor's state. */
export type ShowcaseEditDraft = Required<
  Pick<
    UpdateShowcaseInput,
    | 'slug'
    | 'status'
    | 'showOnHomepage'
    | 'displayOrder'
    | 'titleEn'
    | 'titleKm'
    | 'categoryEn'
    | 'categoryKm'
    | 'summaryEn'
    | 'summaryKm'
    | 'bodyEn'
    | 'bodyKm'
    | 'coverImageKey'
    | 'coverImagePresentation'
    | 'metaTitleEn'
    | 'metaTitleKm'
    | 'metaDescriptionEn'
    | 'metaDescriptionKm'
    | 'sections'
    | 'relatedShowcaseIds'
  >
>;

type ShowcaseEditDraftInput = Omit<ShowcaseEditDraft, 'sections'> & {
  sections: AdminShowcaseDetail['sections'];
};

const nullableText = (value: string | null | undefined) => value?.trim() || null;

/** Normalizes UI values exactly as the editor sends them to the CMS API. */
export function createShowcaseEditDraft(input: ShowcaseEditDraftInput): ShowcaseEditDraft {
  return {
    ...input,
    slug: input.slug.trim(),
    titleEn: input.titleEn.trim(),
    titleKm: input.titleKm.trim(),
    categoryEn: nullableText(input.categoryEn),
    categoryKm: nullableText(input.categoryKm),
    summaryEn: nullableText(input.summaryEn),
    summaryKm: nullableText(input.summaryKm),
    bodyEn: nullableText(input.bodyEn),
    bodyKm: nullableText(input.bodyKm),
    coverImageKey: input.coverImageKey ?? null,
    coverImagePresentation: input.coverImagePresentation,
    metaTitleEn: nullableText(input.metaTitleEn),
    metaTitleKm: nullableText(input.metaTitleKm),
    metaDescriptionEn: nullableText(input.metaDescriptionEn),
    metaDescriptionKm: nullableText(input.metaDescriptionKm),
    sections: input.sections.map((section, displayOrder) => ({
      sectionType: section.sectionType,
      headingEn: nullableText(section.headingEn),
      headingKm: nullableText(section.headingKm),
      bodyEn: nullableText(section.bodyEn),
      bodyKm: nullableText(section.bodyKm),
      imageKey: section.imageKey ?? null,
      displayOrder,
    })),
    relatedShowcaseIds: [...input.relatedShowcaseIds],
  };
}

/** Arrays are ordered CMS content, so preserve their order while comparing. */
export function areShowcaseEditDraftsEqual(
  left: ShowcaseEditDraft | null,
  right: ShowcaseEditDraft | null,
): boolean {
  return left !== null && right !== null && JSON.stringify(left) === JSON.stringify(right);
}

/** One source of truth for both route and browser-unload protection. */
export function isShowcaseEditDirty(
  isEditing: boolean,
  baseline: ShowcaseEditDraft | null,
  draft: ShowcaseEditDraft,
): boolean {
  return isEditing && !areShowcaseEditDraftsEqual(baseline, draft);
}
