import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import type { StoredAppointmentReceipt } from './appointment-history';

type AppointmentHistorySectionProps = {
  history: StoredAppointmentReceipt[];
  onClearHistory: () => void;
  onViewReceipt: (receipt: StoredAppointmentReceipt) => void;
  language?: 'en' | 'km';
};

const historyTranslations = {
  en: {
    sectionTitle: 'Your Recent Requests (Past 7 Days)',
    sectionSubtitle: 'Requests submitted on this browser are remembered for 1 week for your convenience.',
    requestReceived: 'Appointment request received',
    referenceLabel: 'Reference',
    viewReceipt: 'View Request Receipt',
    clearHistory: 'Clear History',
    submittedOn: (dateStr: string) => `Submitted ${dateStr}`,
  },
  km: {
    sectionTitle: 'សំណើថ្មីៗរបស់អ្នក (៧ ថ្ងៃចុងក្រោយ)',
    sectionSubtitle: 'សំណើដែលបានផ្ញើត្រូវបានរក្សាទុកនៅលើកម្មវិធីរុករកនេះរយៈពេល ១ សប្តាហ៍ ដើម្បីភាពងាយស្រួលរបស់អ្នក។',
    requestReceived: 'សំណើសុំណាត់ជួបត្រូវបានទទួល',
    referenceLabel: 'លេខយោង',
    viewReceipt: 'មើលវិក្កយបត្រសំណើ',
    clearHistory: 'សម្អាតប្រវត្តិ',
    submittedOn: (dateStr: string) => `បានផ្ញើនៅ ${dateStr}`,
  },
};

function formatCreatedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

export function AppointmentHistorySection({
  history,
  onClearHistory,
  onViewReceipt,
  language: languageProp,
}: AppointmentHistorySectionProps) {
  let activeLanguage = languageProp;
  try {
    const publicLang = usePublicLanguage();
    activeLanguage = activeLanguage ?? publicLang.language;
  } catch {
    activeLanguage = activeLanguage ?? 'en';
  }

  const t = historyTranslations[activeLanguage === 'km' ? 'km' : 'en'];

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t.sectionTitle}
      className="mx-auto w-full max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-[#cfe5ee] bg-[#f8fcfe] p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,86,135,0.04)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-tight text-[#005687] sm:text-[19px]">
              {t.sectionTitle}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#64748b]">{t.sectionSubtitle}</p>
          </div>
          <button
            className="self-start text-[12px] font-bold text-[#64748b] transition hover:text-[#b91c1c] sm:self-center"
            onClick={onClearHistory}
            type="button"
          >
            {t.clearHistory}
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          {history.map((item) => (
            <Card
              className="flex flex-col justify-between gap-4 rounded-xl border border-[#b9e2ee] bg-white p-4 sm:flex-row sm:items-center sm:p-5 transition hover:border-[#3695b9] shadow-xs"
              key={item.reference}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-2 shrink-0 rounded-full bg-[#16a34a]" />
                  <p className="font-bold text-[#005687]">{t.requestReceived}</p>
                  <span className="rounded-full border border-[#fde68a] bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#92400e]">
                    {item.status}
                  </span>
                  {item.createdAt ? (
                    <span className="text-[11px] text-[#94a3b8]">
                      • {t.submittedOn(formatCreatedDate(item.createdAt))}
                    </span>
                  ) : null}
                </div>

                <div className="text-[13px] text-[#475569]">
                  <span className="font-bold text-[#005687]">{t.referenceLabel}: </span>
                  <span className="font-mono font-bold tracking-wider text-[#005687]">
                    {item.reference}
                  </span>
                  {item.bookingDetails ? (
                    <span className="ml-2 text-[#64748b]">
                      ({item.bookingDetails.serviceName} • {item.bookingDetails.branchName})
                    </span>
                  ) : null}
                </div>
              </div>

              <Button
                className="min-h-10 shrink-0 self-start text-xs font-bold sm:self-center"
                onClick={() => onViewReceipt(item)}
                type="button"
                variant="secondary"
              >
                {t.viewReceipt}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
