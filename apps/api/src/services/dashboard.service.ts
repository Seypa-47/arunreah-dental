import { adminRoleValues, rolesByPermission } from '@arunreah/shared';
import type { DashboardResponse } from '@arunreah/shared';
import { getClinicWeekRange } from '../config/time';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/dashboard.repository';
import { HttpError } from '../shared/http-error';
import type { AuthenticatedAdmin } from '../types/auth';

function hasPermission(
  admin: AuthenticatedAdmin,
  permission: 'APPOINTMENT_MANAGEMENT' | 'CMS_MANAGEMENT',
) {
  return rolesByPermission[permission].includes(admin.role);
}

export async function getAdminDashboard(
  database: DatabaseClient,
  admin: AuthenticatedAdmin,
): Promise<DashboardResponse> {
  if (!adminRoleValues.includes(admin.role)) {
    throw new HttpError(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
  }

  const appointmentAccess = hasPermission(admin, 'APPOINTMENT_MANAGEMENT');
  const contentAccess = hasPermission(admin, 'CMS_MANAGEMENT');
  const response: DashboardResponse = { role: admin.role };

  if (appointmentAccess) {
    const [appointments, recentAppointments] = await Promise.all([
      repository.getAppointmentDashboardSummary(database, getClinicWeekRange()),
      repository.getRecentDashboardAppointments(database),
    ]);
    response.appointments = appointments;
    response.recentAppointments = recentAppointments;
  }

  if (contentAccess) {
    response.content = await repository.getContentDashboardSummary(database);
  }

  return response;
}
