import { beforeEach, describe, expect, it } from 'vitest';
import {
  APPOINTMENT_HISTORY_STORAGE_KEY,
  APPOINTMENT_HISTORY_TTL_MS,
  clearAppointmentHistory,
  getStoredAppointmentHistory,
  saveAppointmentReceipt,
  type StoredAppointmentReceipt,
} from './appointment-history';
import type { AppointmentSuccessBookingDetails } from './appointment-success-modal';

const dummyDetails: AppointmentSuccessBookingDetails = {
  branchName: 'Toul Tompoung Branch',
  branchPhone: '098 701 302',
  dateLabel: 'Tuesday, September 22, 2026',
  doctorName: 'Dr. Chan Vanna',
  email: 'patient@example.com',
  patientName: 'Hong Than Brathna',
  phone: '0969849988',
  serviceName: 'General Dentistry',
  time: '10:00',
};

describe('appointment-history storage', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: mockLocalStorage },
      writable: true,
    });
  });

  it('returns empty array when nothing is stored or invalid JSON is present', () => {
    expect(getStoredAppointmentHistory()).toEqual([]);

    store[APPOINTMENT_HISTORY_STORAGE_KEY] = 'not-valid-json';
    expect(getStoredAppointmentHistory()).toEqual([]);
  });

  it('saves an appointment receipt with a 7-day TTL and retrieves it', () => {
    const fixedNow = 1_700_000_000_000;
    const history = saveAppointmentReceipt(
      {
        bookingDetails: dummyDetails,
        message: 'Request received.',
        reference: 'AR-20260919-E3BFE2',
        status: 'PENDING',
      },
      fixedNow,
    );

    expect(history).toHaveLength(1);
    expect(history[0]?.reference).toBe('AR-20260919-E3BFE2');
    expect(history[0]?.status).toBe('PENDING');
    expect(history[0]?.expiresAt).toBe(fixedNow + APPOINTMENT_HISTORY_TTL_MS);

    const retrieved = getStoredAppointmentHistory(fixedNow);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0]?.reference).toBe('AR-20260919-E3BFE2');
  });

  it('automatically prunes entries older than 7 days', () => {
    const fixedNow = 1_700_000_000_000;
    const eightDaysAgo = fixedNow - 8 * 24 * 60 * 60 * 1000;

    const expiredEntry: StoredAppointmentReceipt = {
      bookingDetails: dummyDetails,
      createdAt: new Date(eightDaysAgo).toISOString(),
      expiresAt: eightDaysAgo + APPOINTMENT_HISTORY_TTL_MS, // expired 1 day ago relative to fixedNow
      message: 'Old request',
      reference: 'AR-OLD-111111',
      status: 'PENDING',
    };

    store[APPOINTMENT_HISTORY_STORAGE_KEY] = JSON.stringify([expiredEntry]);

    const active = getStoredAppointmentHistory(fixedNow);
    expect(active).toEqual([]);
    // Pruned from storage
    expect(store[APPOINTMENT_HISTORY_STORAGE_KEY]).toBe('[]');
  });

  it('deduplicates receipts by reference and keeps up to 10 entries', () => {
    const fixedNow = 1_700_000_000_000;

    saveAppointmentReceipt(
      {
        bookingDetails: dummyDetails,
        message: 'First save',
        reference: 'AR-SAME-REF',
        status: 'PENDING',
      },
      fixedNow,
    );

    saveAppointmentReceipt(
      {
        bookingDetails: dummyDetails,
        message: 'Second save',
        reference: 'AR-SAME-REF',
        status: 'CONFIRMED',
      },
      fixedNow + 1000,
    );

    const retrieved = getStoredAppointmentHistory(fixedNow + 1000);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0]?.status).toBe('CONFIRMED');

    // Add 11 unique entries
    for (let i = 0; i < 11; i += 1) {
      saveAppointmentReceipt(
        {
          bookingDetails: dummyDetails,
          message: `Request ${i}`,
          reference: `AR-REF-${i}`,
          status: 'PENDING',
        },
        fixedNow + (i + 2) * 1000,
      );
    }

    const capped = getStoredAppointmentHistory(fixedNow + 20_000);
    expect(capped.length).toBeLessThanOrEqual(10);
  });

  it('clears stored appointment history cleanly', () => {
    saveAppointmentReceipt({
      bookingDetails: dummyDetails,
      message: 'Request',
      reference: 'AR-12345',
      status: 'PENDING',
    });

    expect(getStoredAppointmentHistory()).toHaveLength(1);
    clearAppointmentHistory();
    expect(getStoredAppointmentHistory()).toHaveLength(0);
  });
});
