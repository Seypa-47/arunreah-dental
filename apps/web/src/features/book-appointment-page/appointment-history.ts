import type { AppointmentSuccessBookingDetails } from './appointment-success-modal';

export const APPOINTMENT_HISTORY_STORAGE_KEY = 'arunreah_recent_appointments';
export const APPOINTMENT_HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)
export const MAX_STORED_APPOINTMENTS = 10;

export type StoredAppointmentReceipt = {
  bookingDetails: AppointmentSuccessBookingDetails;
  createdAt: string;
  expiresAt: number;
  message: string;
  reference: string;
  status: string;
};

export function getStoredAppointmentHistory(now = Date.now()): StoredAppointmentReceipt[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(APPOINTMENT_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const valid = parsed.filter((item): item is StoredAppointmentReceipt => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<StoredAppointmentReceipt>;
      return (
        typeof candidate.reference === 'string' &&
        typeof candidate.status === 'string' &&
        typeof candidate.expiresAt === 'number' &&
        candidate.expiresAt > now &&
        Boolean(candidate.bookingDetails)
      );
    });

    if (valid.length !== parsed.length) {
      window.localStorage.setItem(APPOINTMENT_HISTORY_STORAGE_KEY, JSON.stringify(valid));
    }

    return valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function saveAppointmentReceipt(
  receipt: {
    bookingDetails: AppointmentSuccessBookingDetails;
    message: string;
    reference: string;
    status: string;
  },
  now = Date.now(),
): StoredAppointmentReceipt[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const current = getStoredAppointmentHistory(now);
    const newEntry: StoredAppointmentReceipt = {
      bookingDetails: receipt.bookingDetails,
      createdAt: new Date(now).toISOString(),
      expiresAt: now + APPOINTMENT_HISTORY_TTL_MS,
      message: receipt.message,
      reference: receipt.reference,
      status: receipt.status,
    };

    const updated = [newEntry, ...current.filter((item) => item.reference !== receipt.reference)].slice(
      0,
      MAX_STORED_APPOINTMENTS,
    );

    window.localStorage.setItem(APPOINTMENT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAppointmentHistory(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(APPOINTMENT_HISTORY_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}
