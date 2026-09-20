import { describe, expect, it } from 'vitest';

type EditableDetailSection = {
  sectionType: 'TEXT' | 'IMAGE';
  headingEn: string | null;
  headingKm: string | null;
  bodyEn: string | null;
  bodyKm: string | null;
  imageKey: string | null;
  displayOrder: number;
};

function removeDetailSection(
  sections: EditableDetailSection[],
  indexToDelete: number,
): EditableDetailSection[] {
  return sections
    .filter((_, index) => index !== indexToDelete)
    .map((section, index) => ({ ...section, displayOrder: index }));
}

function nextOpenIndex(
  currentOpenIndex: number | undefined,
  deletedIndex: number,
): number | undefined {
  if (currentOpenIndex === undefined) return undefined;
  if (currentOpenIndex === deletedIndex) return undefined;
  if (currentOpenIndex > deletedIndex) return currentOpenIndex - 1;
  return currentOpenIndex;
}

describe('DetailSections delete logic', () => {
  const sampleSections: EditableDetailSection[] = [
    { sectionType: 'TEXT', headingEn: 'Scaling', headingKm: null, bodyEn: 'Body 1', bodyKm: null, imageKey: null, displayOrder: 0 },
    { sectionType: 'TEXT', headingEn: 'Fillings', headingKm: null, bodyEn: 'Body 2', bodyKm: null, imageKey: null, displayOrder: 1 },
    { sectionType: 'TEXT', headingEn: 'Whitening', headingKm: null, bodyEn: 'Body 3', bodyKm: null, imageKey: null, displayOrder: 2 },
  ];

  it('removes the selected section and recalculates continuous displayOrder', () => {
    const updated = removeDetailSection(sampleSections, 1);
    expect(updated).toHaveLength(2);
    expect(updated[0]?.headingEn).toBe('Scaling');
    expect(updated[0]?.displayOrder).toBe(0);
    expect(updated[1]?.headingEn).toBe('Whitening');
    expect(updated[1]?.displayOrder).toBe(1);
  });

  it('removes the first section correctly', () => {
    const updated = removeDetailSection(sampleSections, 0);
    expect(updated).toHaveLength(2);
    expect(updated[0]?.headingEn).toBe('Fillings');
    expect(updated[0]?.displayOrder).toBe(0);
    expect(updated[1]?.headingEn).toBe('Whitening');
    expect(updated[1]?.displayOrder).toBe(1);
  });

  it('removes the last section correctly', () => {
    const updated = removeDetailSection(sampleSections, 2);
    expect(updated).toHaveLength(2);
    expect(updated[0]?.headingEn).toBe('Scaling');
    expect(updated[0]?.displayOrder).toBe(0);
    expect(updated[1]?.headingEn).toBe('Fillings');
    expect(updated[1]?.displayOrder).toBe(1);
  });

  it('updates openIndex properly when deleting the currently open section', () => {
    expect(nextOpenIndex(1, 1)).toBeUndefined();
  });

  it('shifts openIndex down when deleting a section before the open section', () => {
    expect(nextOpenIndex(2, 0)).toBe(1);
    expect(nextOpenIndex(2, 1)).toBe(1);
  });

  it('preserves openIndex when deleting a section after the open section', () => {
    expect(nextOpenIndex(0, 2)).toBe(0);
  });
});
