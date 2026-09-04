import { describe, expect, it } from 'vitest';
import { getAdminNavigation } from './admin-navigation';

const labelsFor = (role: Parameters<typeof getAdminNavigation>[0]) =>
  getAdminNavigation(role).map((item) => item.label);

describe('role-based admin navigation', () => {
  it('limits receptionists to appointment operations', () => {
    const labels = labelsFor('RECEPTIONIST');
    expect(labels).toContain('Appointments');
    expect(labels).toContain('Inbox');
    expect(labels).not.toContain('Services');
    expect(labels).not.toContain('Clinic Info');
  });

  it('limits CMS admins to content operations', () => {
    const labels = labelsFor('CMS_ADMIN');
    expect(labels).toContain('Services');
    expect(labels).toContain('Doctors');
    expect(labels).toContain('Showcase');
    expect(labels).not.toContain('Appointments');
    expect(labels).not.toContain('Inbox');
  });

  it('gives super admins both navigation groups and hides unimplemented calendar navigation', () => {
    const labels = labelsFor('SUPER_ADMIN');
    expect(labels).toContain('Appointments');
    expect(labels).toContain('Services');
    expect(labels).not.toContain('Calendar');
  });
});
