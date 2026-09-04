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

function PhoneIcon({ className = 'size-3.5' }: { className?: string }) {
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

function ClockIcon({ className = 'size-3.5' }: { className?: string }) {
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
    <Card className="mx-auto flex w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-[#edf2f7] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      {/* Google Maps Satellite Viewport */}
      <div className="relative h-[250px] w-full overflow-hidden bg-[#eaf2f6] sm:h-[270px]">
        <iframe
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Google Maps Satellite - ${name}`}
        />

        {/* Floating Satellite Indicator */}
        <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10.5px] font-bold text-[#3695B9] shadow-[0_2px_8px_rgba(15,23,42,0.12)] backdrop-blur">
          <SatelliteIcon />
          <span>Google Satellite</span>
        </div>
      </div>

      {/* Rich Text Details Under the Map */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Top Row: Badge & Direction Button */}
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7fb] px-3 py-1 text-[11.5px] font-extrabold text-[#3695B9]">
              <span className="size-1.5 rounded-full bg-[#3695B9]" />
              {badge || name}
            </span>

            <a
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3695B9] px-4 py-1.5 text-[12px] font-bold text-white shadow-[0_4px_10px_rgba(54,149,185,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2c84a5]"
              href={directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <LocationIcon className="size-3.5" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Branch Title */}
          <h3 className="mt-3 text-[18px] font-extrabold leading-6 text-[#005687]">
            {name}
          </h3>

          {/* Structured Details with Icons */}
          <div className="mt-4 space-y-2.5">
            {/* Address */}
            <div className="flex items-start gap-2.5 text-[13px] text-[#6b7280]">
              <LocationIcon className="mt-0.5 size-4 shrink-0 text-[#3695B9]" />
              <span className="font-medium leading-relaxed">{address}</span>
            </div>

            {/* Phone numbers */}
            {phone && (
              <div className="flex items-center gap-2.5 text-[13px]">
                <PhoneIcon className="size-4 shrink-0 text-[#3695B9]" />
                <div className="flex flex-wrap gap-x-3 font-bold text-[#005687]">
                  {phone.split(' / ').map((p) => (
                    <a
                      className="transition hover:text-[#3695B9] hover:underline"
                      href={`tel:${p.replace(/\s+/g, '')}`}
                      key={p}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {hours && (
              <div className="flex items-center gap-2.5 text-[12.5px] text-[#6b7280]">
                <ClockIcon className="size-4 shrink-0 text-[#3695B9]" />
                <span>
                  Hours: <strong className="font-bold text-[#005687]">{hours}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
