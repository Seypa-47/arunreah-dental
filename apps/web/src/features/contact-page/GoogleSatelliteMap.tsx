import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

export type GoogleSatelliteMapProps = {
  address: string;
  badge?: string;
  directionsUrl: string;
  hours?: string;
  lat: number;
  lng: number;
  name: string;
  phone?: string;
  zoom?: number;
};

function LocationIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21c-4.97-4.97-8-8.5-8-12a8 8 0 1 1 16 0c0 3.5-3.03 7.03-8 12z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        d="M3 5.5A2.5 2.5 0 0 1 5.5 3h1.6a1.5 1.5 0 0 1 1.48 1.25l.6 3.12a1.5 1.5 0 0 1-.43 1.37l-1.3 1.3a14.07 14.07 0 0 0 6.2 6.2l1.3-1.3a1.5 1.5 0 0 1 1.37-.43l3.12.6A1.5 1.5 0 0 1 20.5 16.9v1.6a2.5 2.5 0 0 1-2.5 2.5h-.5C10 21 3 14 3 6.5v-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SatelliteIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GoogleSatelliteMap({
  address,
  badge,
  directionsUrl,
  hours,
  lat,
  lng,
  name,
  phone,
  zoom = 17,
}: GoogleSatelliteMapProps) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

  // If a Google Maps API Key is provided, call the official Google Maps Embed v1 API in satellite mode.
  // Otherwise, call the direct Google Maps satellite embed API (t=k for satellite imagery).
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&maptype=satellite&zoom=${zoom}`
    : `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border border-[#edf2f7] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      {/* Top Google Maps Satellite Viewport */}
      <div className="relative h-[270px] w-full overflow-hidden bg-[#eaf2f6] sm:h-[300px]">
        <iframe
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Google Maps Satellite - ${name}`}
        />

        {/* Floating Badges */}
        <div className="pointer-events-none absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#005687] shadow-[0_4px_12px_rgba(15,23,42,0.12)] backdrop-blur">
              <span className="size-2 rounded-full bg-[#3695B9]" />
              <span>{badge}</span>
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#3695B9] shadow-[0_4px_12px_rgba(15,23,42,0.12)] backdrop-blur">
            <SatelliteIcon />
            <span>Google Satellite</span>
          </span>
        </div>
      </div>

      {/* Card Content styled consistently with Arunreah brand system */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div>
          {/* Branch Title */}
          <h3 className="text-[20px] font-extrabold leading-7 text-[#005687]">
            {name}
          </h3>

          {/* Details List */}
          <div className="mt-5 space-y-3.5">
            {/* Address */}
            <div className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695B9]">
                <LocationIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#3695B9]">Address</p>
                <p className="mt-0.5 text-[13.5px] font-medium leading-5 text-[#6b7280]">{address}</p>
              </div>
            </div>

            {/* Phone */}
            {phone && (
              <div className="flex items-center gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695B9]">
                  <PhoneIcon className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#3695B9]">Phone</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 font-extrabold text-[#005687]">
                    {phone.split(' / ').map((p) => (
                      <a
                        className="text-[13.5px] transition hover:text-[#3695B9] hover:underline"
                        href={`tel:${p.replace(/\s+/g, '')}`}
                        key={p}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {hours && (
              <div className="flex items-center gap-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695B9]">
                  <ClockIcon className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#3695B9]">Opening Hours</p>
                  <p className="mt-0.5 text-[13.5px] font-extrabold text-[#005687]">{hours}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#edf2f7] pt-5">
          <a
            className="inline-flex h-[42px] min-h-[42px] items-center justify-center gap-2 rounded-full bg-[#3695B9] px-6 text-[13px] font-bold text-white shadow-[0_6px_14px_rgba(54,149,185,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2c84a5]"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <LocationIcon className="size-3.5" />
            <span>Open in Google Maps</span>
          </a>
          <Link
            className="inline-flex h-[42px] min-h-[42px] items-center justify-center gap-2 rounded-full border border-[#d8e6ee] bg-white px-5 text-[13px] font-bold text-[#3695B9] transition hover:-translate-y-0.5 hover:border-[#3695B9] hover:bg-[#f9fcfd]"
            to="/book-appointment"
          >
            <span>Book Appointment &rarr;</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
