import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/api';
import { isTeamCategory, moveIdRelative, teamCategoryTabs, teamMemberSaveError } from './team-workspace';

describe('team workspace helpers', () => {
  it('recognizes only supported category query values', () => {
    expect(isTeamCategory('RECEPTIONIST')).toBe(true);
    expect(isTeamCategory('ALL')).toBe(false);
    expect(isTeamCategory(null)).toBe(false);
  });

  it('defines the all tab followed by all four team categories', () => {
    expect(teamCategoryTabs.map((tab) => tab.category ?? 'ALL')).toEqual([
      'ALL',
      'DENTIST',
      'GENERAL_PRACTITIONER',
      'RECEPTIONIST',
      'ASSISTANT',
    ]);
  });

  it('moves one visible member within the complete category order', () => {
    expect(moveIdRelative(['a', 'hidden', 'b', 'c'], 'c', 'a', 'before')).toEqual(['c', 'a', 'hidden', 'b']);
    expect(moveIdRelative(['a', 'hidden', 'b', 'c'], 'a', 'c', 'before')).toEqual(['hidden', 'b', 'a', 'c']);
    expect(moveIdRelative(['a', 'hidden', 'b', 'c'], 'a', 'c', 'after')).toEqual(['hidden', 'b', 'c', 'a']);
  });

  it('surfaces the appointment-history conflict from a category change', () => {
    const message =
      'This doctor is referenced by appointment history and cannot be changed to a non-clinical category. Unpublish or deactivate the doctor instead.';

    expect(teamMemberSaveError(new ApiClientError({ code: 'CONFLICT', message, status: 409 })))
      .toBe(message);
  });
});
