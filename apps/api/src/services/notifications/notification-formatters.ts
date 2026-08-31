import type { AppointmentNotificationPayload } from './types';

function doctorName(payload: AppointmentNotificationPayload) {
  return payload.doctorName ?? 'No preference';
}

function notes(payload: AppointmentNotificationPayload) {
  return payload.notes ? `Notes: ${payload.notes}` : 'Notes: None';
}

export function appointmentEmailSubject(payload: AppointmentNotificationPayload) {
  return `New Appointment Request — ${payload.reference}`;
}

export function appointmentEmailText(payload: AppointmentNotificationPayload) {
  return [
    'New appointment request received.',
    '',
    `Appointment Reference: ${payload.reference}`,
    'Status: PENDING',
    'Clinic review and manual confirmation are required.',
    '',
    `Patient Name: ${payload.patientName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Service: ${payload.serviceName}`,
    `Doctor: ${doctorName(payload)}`,
    `Branch: ${payload.branchName}`,
    `Preferred Date: ${payload.preferredDate}`,
    `Preferred Time: ${payload.preferredTime}`,
    notes(payload),
  ].join('\n');
}

export function appointmentTelegramText(payload: AppointmentNotificationPayload) {
  const lines = [
    'New Appointment Request',
    '',
    `Ref: ${payload.reference}`,
    `Patient: ${payload.patientName}`,
    `Phone: ${payload.phone}`,
    `Email: ${payload.email}`,
    `Service: ${payload.serviceName}`,
    `Doctor: ${doctorName(payload)}`,
    `Branch: ${payload.branchName}`,
    `Date: ${payload.preferredDate}`,
    `Time: ${payload.preferredTime}`,
    'Status: PENDING',
  ];

  if (payload.notes) lines.push(`Notes: ${payload.notes.slice(0, 600)}`);
  return lines.join('\n');
}
