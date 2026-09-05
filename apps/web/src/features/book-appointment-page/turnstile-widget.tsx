import { useEffect, useRef, useState } from 'react';
import { env } from '@/config/env';

type TurnstileOptions = {
  action: string;
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback': () => void;
  sitekey: string;
};

declare global {
  interface Window {
    turnstile?: {
      remove: (widgetId: string) => void;
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const scriptId = 'cf-turnstile-script';

function loadTurnstile() {
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      if (window.turnstile) resolve();
      else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Turnstile could not load.')), { once: true });
      }
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile could not load.'));
    document.head.append(script);
  });
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  resetSignal: number;
};

export function TurnstileWidget({ onToken, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const siteKey = env.turnstileSiteKey;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let active = true;

    void loadTurnstile().then(() => {
      if (!active || !window.turnstile || !containerRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        action: 'appointment_request',
        callback: (token) => onToken(token),
        'error-callback': () => {
          onToken(null);
          setLoadError(true);
        },
        'expired-callback': () => onToken(null),
        sitekey: siteKey,
      });
    }).catch(() => {
      if (active) setLoadError(true);
    });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
  }, [onToken, siteKey]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onToken(null);
    }
  }, [onToken, resetSignal]);

  if (!siteKey) return null;
  if (loadError) return <p className="text-sm font-medium text-[#9d4d18]" role="alert">Verification could not load. Please refresh the page and try again.</p>;

  return <div aria-label="Spam protection verification" ref={containerRef} />;
}
