import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export type AppointmentSuccessBookingDetails = {
  branchName: string;
  branchPhone?: string;
  dateLabel: string;
  doctorName: string;
  email?: string;
  patientName: string;
  phone: string;
  serviceName: string;
  time: string;
};

type AppointmentSuccessModalProps = {
  acknowledgement: {
    message: string;
    reference: string;
    status: string;
  };
  bookingDetails: AppointmentSuccessBookingDetails;
  isOpen: boolean;
  onBookAnother: () => void;
  onClose: () => void;
  language?: 'en' | 'km';
};


const modalTranslations = {
  en: {
    title: 'Appointment Request Received!',
    subtitle: (name: string) =>
      `Thank you, ${name}! We have received your appointment request. Our reception team is reviewing doctor availability.`,
    referenceLabel: 'Appointment Reference',
    pendingBadge: 'Pending Review',
    copyButton: 'Copy',
    copiedButton: 'Copied!',
    copyHint: 'Save this reference code for your records and clinic inquiries.',
    detailsTitle: 'Requested Appointment Details',
    service: 'Service',
    branch: 'Branch',
    doctor: 'Doctor',
    dateTime: 'Schedule',
    phone: 'Contact Phone',
    emailNotice: (email: string) =>
      `An acknowledgment email with complete details has been sent to ${email}.`,
    noticeHeading: 'Please Note',
    noticeText: (phone: string) =>
      `This is an appointment request pending review, not an automatic confirmation. Our clinic staff will call you at ${phone} to confirm your appointment.`,
    doneButton: 'Done',
    bookAnotherButton: 'Book Another Request',
    urgentHeading: 'Need Immediate Help?',
    urgentHours: 'Mon – Sun: 8:00 AM – 7:00 PM',
  },
  km: {
    title: 'សំណើសុំណាត់ជួបត្រូវបានទទួល!',
    subtitle: (name: string) =>
      `សូមអរគុណ ${name}! យើងខ្ញុំបានទទួលសំណើកក់ការណាត់ជួបរបស់អ្នកហើយ។ ក្រុមការងារទទួលភ្ញៀវកំពុងពិនិត្យមើលកាលវិភាគវេជ្ជបណ្ឌិត។`,
    referenceLabel: 'លេខយោងការណាត់ជួប',
    pendingBadge: 'រង់ចាំការពិនិត្យ',
    copyButton: 'ចម្លង',
    copiedButton: 'បានចម្លង!',
    copyHint: 'សូមរក្សាទុកលេខកូដយោងនេះ សម្រាប់តាមដានព័ត៌មានជាមួយគ្លីនិក។',
    detailsTitle: 'ព័ត៌មានលម្អិតនៃសំណើ',
    service: 'សេវាកម្ម',
    branch: 'សាខា',
    doctor: 'វេជ្ជបណ្ឌិត',
    dateTime: 'កាលបរិច្ឆេទ & ម៉ោង',
    phone: 'លេខទូរស័ព្ទ',
    emailNotice: (email: string) =>
      `ច្បាប់ចម្លងការទទួលស្គាល់ត្រូវបានផ្ញើទៅកាន់ ${email} រួចហើយ។`,
    noticeHeading: 'កំណត់សម្គាល់សំខាន់',
    noticeText: (phone: string) =>
      `នេះគ្រាន់តែជាការទទួលស្គាល់សំណើប៉ុណ្ណោះ មិនទាន់ជាការបញ្ជាក់ស្ថាពរឡើយ។ ក្រុមការងារគ្លីនិកនឹងទូរស័ព្ទទៅកាន់ ${phone} ដើម្បីបញ្ជាក់ការណាត់ជួបរបស់អ្នក។`,
    doneButton: 'យល់ព្រម',
    bookAnotherButton: 'កក់ការណាត់ជួបផ្សេងទៀត',
    urgentHeading: 'ត្រូវការជំនួយបន្ទាន់?',
    urgentHours: 'ច័ន្ទ – អាទិត្យ៖ ៨:០០ ព្រឹក – ៧:០០ យប់',
  },
};

export function AppointmentSuccessModal({
  acknowledgement,
  bookingDetails,
  isOpen,
  onBookAnother,
  onClose,
  language: languageProp,
}: AppointmentSuccessModalProps) {
  let activeLanguage = languageProp;
  try {
    const publicLanguage = usePublicLanguage();
    activeLanguage = activeLanguage ?? publicLanguage.language;
  } catch {
    activeLanguage = activeLanguage ?? 'en';
  }

  const t = modalTranslations[activeLanguage === 'km' ? 'km' : 'en'];
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(acknowledgement.reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard write failed or restricted by browser
    }
  };

  const branchContact = bookingDetails.branchPhone || '098 701 302 / 069 978 997';

  return (
    <div
      aria-labelledby="appointment-success-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="relative max-h-[92vh] w-full max-w-[540px] overflow-y-auto rounded-2xl border border-[#d9e9ee] bg-white p-6 shadow-[0_25px_60px_-15px_rgba(0,86,135,0.25)] sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent bar */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#005687] via-[#3695b9] to-[#075d83]"
        />

        {/* Close icon button */}
        <button
          aria-label="Close appointment confirmation modal"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#005687]"
          onClick={onClose}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Celebratory Success Icon */}
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#ecfdf5] text-[#059669] shadow-sm ring-8 ring-[#ecfdf5]/80">
          <svg
            aria-hidden="true"
            className="size-8"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        {/* Header Titles */}
        <div className="text-center">
          <h2
            className="text-[22px] font-extrabold tracking-[-0.02em] text-[#005687] sm:text-[24px]"
            id="appointment-success-modal-title"
          >
            {t.title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">
            {t.subtitle(bookingDetails.patientName)}
          </p>
        </div>

        {/* Reference & Status Card */}
        <div className="mt-5 rounded-xl border border-[#d9e4eb] bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              {t.referenceLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-[#fde68a] bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#92400e]">
              {t.pendingBadge}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="select-all font-mono text-[18px] font-extrabold tracking-wider text-[#005687] sm:text-[20px]">
              {acknowledgement.reference}
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-[12px] font-bold text-[#005687] shadow-xs transition hover:border-[#3695b9] hover:bg-[#f1f8fa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#005687]"
              onClick={handleCopy}
              type="button"
            >
              {copied ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="size-3.5 text-[#16a34a]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-[#16a34a]">{t.copiedButton}</span>
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    className="size-3.5 text-[#3695b9]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect height="13" rx="2" width="13" x="9" y="9" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{t.copyButton}</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[#64748b]">{t.copyHint}</p>
        </div>

        {/* Requested Details Table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-[#e2e8f0]">
          <div className="bg-[#f1f5f9] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#475569]">
            {t.detailsTitle}
          </div>
          <div className="divide-y divide-[#f1f5f9] text-[13px]">
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="font-medium text-[#64748b]">{t.service}</span>
              <span className="text-right font-bold text-[#0f172a]">{bookingDetails.serviceName}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="font-medium text-[#64748b]">{t.branch}</span>
              <span className="text-right font-bold text-[#0f172a]">{bookingDetails.branchName}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="font-medium text-[#64748b]">{t.doctor}</span>
              <span className="text-right font-semibold text-[#334155]">{bookingDetails.doctorName}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="font-medium text-[#64748b]">{t.dateTime}</span>
              <span className="text-right font-bold text-[#005687]">
                {bookingDetails.dateLabel} • {bookingDetails.time}
              </span>
            </div>
            <div className="flex justify-between px-3.5 py-2.5">
              <span className="font-medium text-[#64748b]">{t.phone}</span>
              <span className="text-right font-semibold text-[#0f172a]">{bookingDetails.phone}</span>
            </div>
          </div>
        </div>

        {/* Email Notification Callout */}
        {bookingDetails.email ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#bae6fd] bg-[#f0f9ff] p-3 text-[12px] leading-relaxed text-[#0369a1]">
            <svg
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-[#0284c7]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect height="14" rx="2" width="20" x="2" y="5" />
              <path d="m2 7 10 7 10-7" />
            </svg>
            <span>{t.emailNotice(bookingDetails.email)}</span>
          </div>
        ) : null}

        {/* Informational Callout (Product Boundary Compliance) */}
        <div className="mt-3 rounded-xl border-l-4 border-[#3b82f6] bg-[#eff6ff] p-3 text-[12px] leading-relaxed text-[#1e40af]">
          <p className="font-bold">{t.noticeHeading}</p>
          <p className="mt-0.5">{t.noticeText(bookingDetails.phone)}</p>
        </div>

        {/* Direct Branch Assistance Note */}
        <div className="mt-3 text-center text-[12px] text-[#64748b]">
          <span>{t.urgentHeading} </span>
          <a
            className="font-bold text-[#005687] hover:underline"
            href={`tel:${branchContact.replaceAll(/[^0-9+]/g, '')}`}
          >
            {branchContact}
          </a>
          <span className="mt-0.5 block text-[11px] text-[#94a3b8]">{t.urgentHours}</span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            className="min-h-11 w-full text-[13px] sm:w-auto"
            onClick={onBookAnother}
            type="button"
            variant="secondary"
          >
            {t.bookAnotherButton}
          </Button>
          <Button
            className="min-h-11 w-full text-[13px] sm:w-auto"
            onClick={onClose}
            type="button"
            variant="primary"
          >
            {t.doneButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
