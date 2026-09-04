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
    <Card className="flex flex-col overflow-hidden rounded-xl border border-[#edf2f7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
      {/* Compact Google Maps Satellite Viewport */}
      <div className="relative h-[210px] w-full overflow-hidden bg-[#eaf2f6] sm:h-[220px]">
        <iframe
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Google Maps Satellite - ${name}`}
        />

        {/* Floating Satellite Indicator */}
        <div className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#3695B9] shadow-sm backdrop-blur">
          <span className="size-1.5 rounded-full bg-[#3695B9]" />
          <span>Google Satellite</span>
        </div>
      </div>

      {/* Compact Content Area */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full bg-[#3695B9]" />
              <h3 className="truncate text-[15px] font-extrabold text-[#005687]">{badge || name}</h3>
            </div>
            <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[#6b7280]">{address}</p>
          </div>

          {/* Action Button */}
          <a
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3695B9] px-4 py-1.5 text-[12px] font-bold text-white shadow-[0_4px_10px_rgba(54,149,185,0.22)] transition hover:bg-[#005687]"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>Open Maps</span>
            <svg aria-hidden="true" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Compact Bottom Metadata (Phone & Hours) */}
        {(phone || hours) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[#edf2f7] pt-2.5 text-[11.5px]">
            {phone && (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#3695B9]">Phone:</span>
                <span className="font-bold text-[#005687]">{phone}</span>
              </div>
            )}
            {hours && (
              <div className="flex items-center gap-1.5 text-[#6b7280]">
                <span className="font-extrabold text-[#3695B9]">Hours:</span>
                <span className="font-medium text-[#005687]">{hours}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
