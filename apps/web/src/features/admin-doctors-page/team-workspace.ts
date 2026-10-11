import { teamCategoryValues, type TeamCategory } from '@arunreah/shared';
import { ApiClientError } from '@/lib/api';

export type TeamCategoryTab = {
  category?: TeamCategory;
  emptyDescription: string;
  label: string;
  noun: string;
};

export const teamCategoryTabs: readonly TeamCategoryTab[] = [
  { label: 'All', noun: 'team members', emptyDescription: 'Add the first team member to begin building the public team directory.' },
  { category: 'DENTIST', label: 'Dentists', noun: 'dentists', emptyDescription: 'Add a dentist to publish their clinical profile and booking availability.' },
  { category: 'GENERAL_PRACTITIONER', label: 'General Practitioners', noun: 'general practitioners', emptyDescription: 'Add a general practitioner to publish their medical profile and booking availability.' },
  { category: 'RECEPTIONIST', label: 'Receptionists', noun: 'receptionists', emptyDescription: 'Add a receptionist to introduce the team members who welcome and support patients.' },
  { category: 'ASSISTANT', label: 'Assistants', noun: 'assistants', emptyDescription: 'Add an assistant to introduce the team members who support clinical care.' },
] as const;

export function isTeamCategory(value: string | null): value is TeamCategory {
  return value !== null && (teamCategoryValues as readonly string[]).includes(value);
}

export function teamCategoryLabel(category: TeamCategory): string {
  return teamCategoryTabs.find((tab) => tab.category === category)?.label ?? category;
}

export function moveIdRelative(ids: readonly string[], movingId: string, targetId: string, placement: 'before' | 'after'): string[] {
  if (movingId === targetId || !ids.includes(movingId) || !ids.includes(targetId)) return [...ids];
  const withoutMoving = ids.filter((id) => id !== movingId);
  const targetIndex = withoutMoving.indexOf(targetId);
  const insertionIndex = placement === 'after' ? targetIndex + 1 : targetIndex;
  return [
    ...withoutMoving.slice(0, insertionIndex),
    movingId,
    ...withoutMoving.slice(insertionIndex),
  ];
}

export function teamMemberSaveError(error: unknown): string {
  if (error instanceof ApiClientError && error.code === 'CONFLICT') {
    return error.message || 'This team member cannot be changed because appointment history exists.';
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Unable to save this team member. Please check the form and try again.';
}
