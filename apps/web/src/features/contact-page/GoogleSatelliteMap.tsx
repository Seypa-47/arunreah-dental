export type GoogleSatelliteMapProps = {
  address: string;
  badge?: string;
  directionsUrl: string;
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
  phone,
  zoom = 17,
}: GoogleSatelliteMapProps) {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

  // If a Google Maps API Key is provided, call the official Google Maps Embed v1 API in satellite mode.
  // Otherwise, call the standard Google Maps satellite embed API (t=k for satellite imagery).
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${lat},${lng}&maptype=satellite&zoom=${zoom}`
    : `https://maps.google.com/maps?q=${lat},${lng}&t=k&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Card Header with Branch & Satellite Tag */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-[#f8fafc] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#3695B9]" />
          <h3 className="text-[13.5px] font-extrabold text-[#005687] sm:text-[14px]">{badge || name}</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Google Satellite</span>
        </div>
      </div>

      {/* Google Maps Satellite Embed iframe */}
      <div className="relative h-[280px] w-full bg-slate-900 sm:h-[320px]">
        <iframe
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Google Maps Satellite - ${name}`}
        />
      </div>

      {/* Card Footer with Address, Contact & Directions */}
      <div className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[12.5px] font-medium text-slate-600">{address}</p>
          {phone && <p className="mt-0.5 text-[11.5px] font-bold text-[#3695B9]">📞 {phone}</p>}
        </div>
        <a
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#005687] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#3695B9] hover:shadow"
          href={directionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span>Open Google Maps</span>
          <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </article>
  );
}
