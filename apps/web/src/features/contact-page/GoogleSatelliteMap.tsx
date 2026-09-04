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
  lat,
  lng,
  name,
  zoom = 17,
}: GoogleSatelliteMapProps) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

  // If a Google Maps API Key is provided, call the official Google Maps Embed v1 API in satellite mode.
  // Otherwise, call the direct Google Maps satellite embed API (t=k for satellite imagery).
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&maptype=satellite&zoom=${zoom}`
    : `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card className="mx-auto flex w-full max-w-[500px] flex-col overflow-hidden rounded-xl border border-[#edf2f7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
      {/* Well-Proportioned Google Maps Satellite Viewport */}
      <div className="relative h-[245px] w-full overflow-hidden bg-[#eaf2f6] sm:h-[260px]">
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

      {/* Sleek Compact Footer */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-[#3695B9]" />
            <h3 className="truncate text-[14px] font-extrabold text-[#005687]">{badge || name}</h3>
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11.5px] font-medium text-[#6b7280]">{address}</p>
        </div>

        {/* Action Button */}
        <a
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#3695B9] px-3.5 py-1.5 text-[11.5px] font-bold text-white shadow-[0_3px_8px_rgba(54,149,185,0.2)] transition hover:bg-[#005687]"
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
    </Card>
  );
}
