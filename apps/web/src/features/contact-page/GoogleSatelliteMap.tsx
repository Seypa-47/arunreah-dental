import { useEffect, useRef, useState } from 'react';

interface LeafletMap {
  invalidateSize: () => void;
  remove: () => void;
  setView: (center: [number, number], zoom: number) => LeafletMap;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: string) => LeafletMarker;
}

interface LeafletGlobal {
  divIcon: (options: {
    className?: string;
    html: string;
    iconAnchor?: [number, number];
    iconSize?: [number, number];
  }) => unknown;
  map: (element: HTMLElement, options: Record<string, unknown>) => LeafletMap;
  marker: (latlng: [number, number], options?: Record<string, unknown>) => LeafletMarker;
  tileLayer: (urlTemplate: string, options: Record<string, unknown>) => LeafletTileLayer;
}

declare global {
  interface Window {
    L?: LeafletGlobal;
  }
}

let leafletPromise: Promise<LeafletGlobal> | null = null;

function loadLeafletAssets(): Promise<LeafletGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is undefined'));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise<LeafletGlobal>((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = '/assets/maps/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js') as HTMLScriptElement | null;
    if (existingScript) {
      const checkTimer = window.setInterval(() => {
        if (window.L) {
          window.clearInterval(checkTimer);
          resolve(window.L);
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = '/assets/maps/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      } else {
        reject(new Error('Leaflet script loaded but window.L is undefined'));
      }
    };
    script.onerror = (err) => {
      leafletPromise = null;
      reject(err);
    };
    document.body.appendChild(script);
  });

  return leafletPromise;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    loadLeafletAssets()
      .then((L) => {
        if (isCancelled || !containerRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(containerRef.current, {
          attributionControl: false,
          center: [lat, lng],
          scrollWheelZoom: false,
          zoom,
          zoomControl: false,
        });

        mapInstanceRef.current = map;

        // Hybrid Google Satellite Layer: high-res satellite photography with clear street and landmark labels
        L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
        }).addTo(map);

        // Custom Arunreah cyan & navy pin marker
        const pinHtml = `
          <div style="position:relative; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="width: 38px; height: 38px; border-radius: 50% 50% 50% 0; background: #005687; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); border: 2.5px solid #FFFFFF;">
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #3695B9; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF;"></div>
              </div>
            </div>
          </div>
        `;

        const pinIcon = L.divIcon({
          className: 'arunreah-map-pin',
          html: pinHtml,
          iconAnchor: [0, 0],
          iconSize: [0, 0],
        });

        const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 180px;">
            <div style="font-size: 13px; font-weight: 800; color: #005687; margin-bottom: 3px;">${name}</div>
            <div style="font-size: 11px; color: #475569; line-height: 1.4; margin-bottom: 8px;">${address}</div>
            ${phone ? `<div style="font-size: 11px; color: #3695B9; font-weight: 600; margin-bottom: 8px;">📞 ${phone}</div>` : ''}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; text-align: center; background: #005687; color: white; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; box-sizing: border-box;">
              Open in Google Maps &rarr;
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Ensure map renders all tiles correctly after DOM layout
        window.setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            setIsLoaded(true);
          }
        }, 120);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to load Google Satellite map:', err);
          setLoadError(true);
        }
      });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, name, address, phone, directionsUrl]);

  return (
    <div className="relative flex h-[340px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-md sm:h-[380px]">
      {/* Top Bar Badges */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
        {/* Branch pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-lg backdrop-blur-md">
          <span className="size-2 rounded-full bg-[#3695B9]" />
          <span>{badge || name}</span>
        </div>

        {/* Google Satellite Indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1.5 text-[11px] font-medium tracking-wide text-slate-200 shadow-lg backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Google Satellite</span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="h-full w-full" ref={containerRef} />

      {/* Zoom controls */}
      <div className="absolute right-3 top-14 z-10 flex flex-col overflow-hidden rounded-lg bg-slate-900/90 shadow-md backdrop-blur-md">
        <button
          aria-label="Zoom in"
          className="flex size-8 items-center justify-center text-[16px] font-bold text-white transition-colors hover:bg-[#3695B9]"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          type="button"
        >
          +
        </button>
        <div className="h-[1px] w-full bg-slate-700" />
        <button
          aria-label="Zoom out"
          className="flex size-8 items-center justify-center text-[16px] font-bold text-white transition-colors hover:bg-[#3695B9]"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          type="button"
        >
          &minus;
        </button>
      </div>

      {/* Loading Skeleton */}
      {!isLoaded && !loadError && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-lg">
            <svg className="size-4 animate-spin text-[#3695B9]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading Google Satellite...</span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
          <p className="text-sm font-semibold">Unable to load interactive satellite view.</p>
          <a
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#3695B9] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#005687]"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in Google Maps &rarr;
          </a>
        </div>
      )}

      {/* Bottom Floating Info Card */}
      <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/40 bg-white/95 p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.22)] backdrop-blur-md">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-[14px] font-extrabold text-[#005687]">{name}</h4>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-600">{address}</p>
          </div>
          <a
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#005687] px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#3695B9] hover:shadow"
            href={directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>Open in Google Maps</span>
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
