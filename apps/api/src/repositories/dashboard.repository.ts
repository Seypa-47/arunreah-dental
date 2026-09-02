import { count, desc, sql } from 'drizzle-orm';
import { appointments, branches, doctors, services, showcases } from '../db/schema';
import type { DatabaseClient } from '../db/client';

type ContentTable = typeof services | typeof doctors | typeof showcases | typeof branches;

function contentCountFields(table: ContentTable) {
  return {
    total: count(),
    published: sql<number>`coalesce(sum(case when ${table.status} = 'PUBLISHED' then 1 else 0 end), 0)`,
    draft: sql<number>`coalesce(sum(case when ${table.status} = 'DRAFT' then 1 else 0 end), 0)`,
    archived: sql<number>`coalesce(sum(case when ${table.status} = 'ARCHIVED' then 1 else 0 end), 0)`,
  };
}

export async function getAppointmentDashboardSummary(
  database: DatabaseClient,
  dates: { today: string; fromDate: string; toDate: string },
) {
  const [summary] = await database
    .select({
      pending: sql<number>`coalesce(sum(case when ${appointments.status} = 'PENDING' then 1 else 0 end), 0)`,
      confirmedToday: sql<number>`coalesce(sum(case when ${appointments.status} = 'CONFIRMED' and ${appointments.preferredDate} = ${dates.today} then 1 else 0 end), 0)`,
      confirmedThisWeek: sql<number>`coalesce(sum(case when ${appointments.status} = 'CONFIRMED' and ${appointments.preferredDate} >= ${dates.fromDate} and ${appointments.preferredDate} <= ${dates.toDate} then 1 else 0 end), 0)`,
    })
    .from(appointments);

  return {
    pending: Number(summary?.pending ?? 0),
    confirmedToday: Number(summary?.confirmedToday ?? 0),
    confirmedThisWeek: Number(summary?.confirmedThisWeek ?? 0),
  };
}

export async function getRecentDashboardAppointments(database: DatabaseClient) {
  return database
    .select({
      id: appointments.id,
      reference: appointments.reference,
      patientName: appointments.patientName,
      serviceNameSnapshot: appointments.serviceNameSnapshot,
      preferredDate: appointments.preferredDate,
      preferredTime: appointments.preferredTime,
      status: appointments.status,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .orderBy(desc(appointments.createdAt))
    .limit(5);
}

export async function getContentDashboardSummary(database: DatabaseClient) {
  const [servicesResult, doctorsResult, showcasesResult, branchesResult] = await Promise.all([
    database.select(contentCountFields(services)).from(services),
    database.select(contentCountFields(doctors)).from(doctors),
    database.select(contentCountFields(showcases)).from(showcases),
    database.select(contentCountFields(branches)).from(branches),
  ]);

  const normalize = (value: (typeof servicesResult)[number] | undefined) => ({
    total: Number(value?.total ?? 0),
    published: Number(value?.published ?? 0),
    draft: Number(value?.draft ?? 0),
    archived: Number(value?.archived ?? 0),
  });

  return {
    services: normalize(servicesResult[0]),
    doctors: normalize(doctorsResult[0]),
    showcases: normalize(showcasesResult[0]),
    branches: normalize(branchesResult[0]),
  };
}
