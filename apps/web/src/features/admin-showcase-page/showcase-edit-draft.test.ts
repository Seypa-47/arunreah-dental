import { describe, expect, it } from 'vitest';
import { areShowcaseEditDraftsEqual, createShowcaseEditDraft, isShowcaseEditDirty, type ShowcaseEditDraft } from './showcase-edit-draft';

const baseDraft: ShowcaseEditDraft = {
  slug: 'family-smiles', status: 'PUBLISHED', showOnHomepage: true, displayOrder: 3,
  titleEn: 'Family smiles', titleKm: 'គ្រួសារញញឹម', categoryEn: 'Patient Education', categoryKm: null,
  summaryEn: 'A useful summary', summaryKm: null, bodyEn: 'A useful article body', bodyKm: null,
  coverImageKey: 'showcases/family.jpg', coverImagePresentation: { positionX: 50, positionY: 50, zoom: 1 }, metaTitleEn: null, metaTitleKm: null,
  metaDescriptionEn: null, metaDescriptionKm: null, relatedShowcaseIds: ['related-one'],
  sections: [{ sectionType: 'TEXT', headingEn: 'Heading', headingKm: null, bodyEn: 'Body', bodyKm: null, imageKey: null, displayOrder: 0 }],
};

describe('Showcase edit draft', () => {
  it('treats an unchanged persisted draft as clean', () => {
    expect(areShowcaseEditDraftsEqual(baseDraft, { ...baseDraft })).toBe(true);
    expect(isShowcaseEditDirty(true, baseDraft, { ...baseDraft })).toBe(false);
  });

  it('marks a changed persisted field as dirty and clears it when changed back', () => {
    const changed = { ...baseDraft, titleEn: 'Updated family smiles' };
    expect(areShowcaseEditDraftsEqual(baseDraft, changed)).toBe(false);
    expect(isShowcaseEditDirty(true, baseDraft, changed)).toBe(true);
    expect(areShowcaseEditDraftsEqual(baseDraft, { ...changed, titleEn: baseDraft.titleEn })).toBe(true);
    expect(isShowcaseEditDirty(true, baseDraft, { ...changed, titleEn: baseDraft.titleEn })).toBe(false);
  });

  it('normalizes empty optional text and section identifiers exactly as the save payload does', () => {
    const normalized = createShowcaseEditDraft({
      ...baseDraft,
      categoryKm: '  ', summaryKm: '', sections: [{
        id: 'local-only-id', sectionType: 'TEXT', headingEn: ' Heading ', headingKm: null,
        bodyEn: 'Body', bodyKm: null, imageKey: null, displayOrder: 0,
      }],
    });
    expect(normalized.categoryKm).toBeNull();
    expect(normalized.summaryKm).toBeNull();
    expect(normalized.sections[0]).toEqual({
      sectionType: 'TEXT', headingEn: 'Heading', headingKm: null, bodyEn: 'Body', bodyKm: null, imageKey: null, displayOrder: 0,
    });
  });

  it('keeps ordered related showcases and sections meaningful for CMS updates', () => {
    expect(areShowcaseEditDraftsEqual(baseDraft, { ...baseDraft, relatedShowcaseIds: ['different'] })).toBe(false);
    expect(areShowcaseEditDraftsEqual(baseDraft, { ...baseDraft, sections: [{
      sectionType: 'TEXT', headingEn: 'Heading', headingKm: null, bodyEn: 'Changed', bodyKm: null, imageKey: null, displayOrder: 0,
    }] })).toBe(false);
  });

  it('treats saved cover-image framing as persisted CMS content', () => {
    expect(areShowcaseEditDraftsEqual(baseDraft, {
      ...baseDraft,
      coverImagePresentation: { positionX: 35, positionY: 20, zoom: 1.2 },
    })).toBe(false);
  });

  it('uses the successful save draft as the new clean baseline while a failed save keeps the prior baseline', () => {
    const pendingDraft = { ...baseDraft, titleEn: 'Saved title' };
    const baselineAfterSuccessfulSave = pendingDraft;

    expect(isShowcaseEditDirty(false, baselineAfterSuccessfulSave, pendingDraft)).toBe(false);
    expect(isShowcaseEditDirty(true, baselineAfterSuccessfulSave, pendingDraft)).toBe(false);
    expect(isShowcaseEditDirty(true, baseDraft, pendingDraft)).toBe(true);
  });

  it('only enables route and browser-unload protection for an active dirty editor', () => {
    const changed = { ...baseDraft, showOnHomepage: false };
    expect(isShowcaseEditDirty(false, baseDraft, changed)).toBe(false);
    expect(isShowcaseEditDirty(true, baseDraft, changed)).toBe(true);
  });
});
