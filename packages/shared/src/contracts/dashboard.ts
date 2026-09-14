import type { AdminRole } from '../auth/roles';
import type { AppointmentStatus } from '../schemas/appointments';

export type DashboardContentMetric = {
  total: number;
  published: number;
  draft: number;
  archived: number;
};

export type DashboardContentSummary = {
  services: DashboardContentMetric;
  doctors: DashboardContentMetric;
  showcases: DashboardContentMetric;
  branches: DashboardContentMetric;
};

export type DashboardAppointmentSummary = {
  pending: number;
  confirmedToday: number;
  confirmedThisWeek: number;
};

export type DashboardRecentAppointment = {
  id: string;
  reference: string;
  patientName: string;
  serviceNameSnapshot: string;
  preferredDate: string;
  preferredTime: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type DashboardResponse = {
  role: AdminRole;
  appointments?: DashboardAppointmentSummary;
  content?: DashboardContentSummary;
  recentAppointments?: DashboardRecentAppointment[];
};
