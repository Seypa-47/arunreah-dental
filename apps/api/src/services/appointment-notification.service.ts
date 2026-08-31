type AppointmentNotification = { reference: string };

/**
 * Provider delivery is deliberately deferred. This hook keeps future email and
 * Telegram implementations separate from appointment persistence.
 */
export async function notifyClinicOfAppointment(_appointment: AppointmentNotification) {
  void _appointment;
  return Promise.resolve();
}
