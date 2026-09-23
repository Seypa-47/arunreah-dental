import { useEffect, useRef, useState } from 'react';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { env } from '@/config/env';

type TurnstileOptions = {
  action?: string;
  callback: (token: string) => void;
  'error-callback'?: (errorCode?: string | number) => void;
  'expired-callback'?: () => void;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  sitekey: string;
  theme?: 'auto' | 'light' | 'dark';
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
const ONLOAD_CALLBACK_NAME = 'cfTurnstileInit';

let turnstileLoadPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is undefined'));
  }

  if (window.turnstile && typeof window.turnstile.render === 'function') {
    return Promise.resolve();
  }

  if (turnstileLoadPromise) {
    return turnstileLoadPromise;
  }

  turnstileLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile && typeof window.turnstile.render === 'function') {
      resolve();
      return;
    }

    (window as unknown as Record<string, () => void>)[ONLOAD_CALLBACK_NAME] = () => {
      resolve();
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      const checkInterval = window.setInterval(() => {
        if (window.turnstile && typeof window.turnstile.render === 'function') {
          window.clearInterval(checkInterval);
          resolve();
        }
      }, 50);

      window.setTimeout(() => {
        window.clearInterval(checkInterval);
        if (window.turnstile && typeof window.turnstile.render === 'function') {
          resolve();
        } else {
          turnstileLoadPromise = null;
          reject(new Error('Turnstile initialization timed out.'));
        }
      }, 6000);
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = scriptId;
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${ONLOAD_CALLBACK_NAME}&render=explicit`;
    script.onerror = () => {
      turnstileLoadPromise = null;
      reject(new Error('Turnstile script failed to load.'));
    };
    document.head.append(script);

    window.setTimeout(() => {
      if (!window.turnstile || typeof window.turnstile.render !== 'function') {
        turnstileLoadPromise = null;
        reject(new Error('Turnstile script load timed out.'));
      }
    }, 10000);
  });

  return turnstileLoadPromise;
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  resetSignal: number;
};

export function TurnstileWidget({ onToken, resetSignal }: TurnstileWidgetProps) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language).booking;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const prevResetSignalRef = useRef(resetSignal);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const siteKey = env.turnstileSiteKey;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let active = true;

    setIsLoading(true);
    setLoadError(false);

    void loadTurnstile()
      .then(() => {
        if (!active || !window.turnstile || !containerRef.current) return;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Ignore if widget was already cleaned up.
          }
          widgetIdRef.current = undefined;
        }
        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          action: 'appointment_request',
          callback: (token) => {
            if (active) onToken(token);
          },
          'error-callback': () => {
            if (active) onToken(null);
          },
          'expired-callback': () => {
            if (active) onToken(null);
          },
          'refresh-expired': 'auto',
          retry: 'auto',
          sitekey: siteKey,
          theme: 'light',
        });

        if (active) {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setIsLoading(false);
          setLoadError(true);
        }
      });

    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore on unmount
        }
        widgetIdRef.current = undefined;
      }
    };
  }, [onToken, siteKey, retryCount]);

  useEffect(() => {
    if (prevResetSignalRef.current !== resetSignal) {
      prevResetSignalRef.current = resetSignal;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        onToken(null);
      }
    }
  }, [onToken, resetSignal]);

  const handleRetry = () => {
    turnstileLoadPromise = null;
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    setRetryCount((prev) => prev + 1);
  };

  if (!siteKey) return null;

  if (loadError) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#f5c6cb] bg-[#fff5f5] p-3 text-sm text-[#9d4d18]" role="alert">
        <p className="font-medium">{copy.verificationFailed}</p>
        <button
          className="w-fit rounded border border-[#9d4d18]/30 bg-white px-3 py-1 text-xs font-semibold text-[#9d4d18] transition hover:bg-[#fff0f0]"
          onClick={handleRetry}
          type="button"
        >
          {copy.verificationRetry}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[65px] py-1">
      {isLoading ? (
        <div className="flex h-[65px] w-full max-w-[300px] items-center gap-2.5 rounded-lg border border-[#e1ebef] bg-[#f7fafc] px-3.5 text-xs text-[#64748b]">
          <svg className="size-4 animate-spin text-[#005687]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" />
          </svg>
          <span>{copy.verificationLoading}</span>
        </div>
      ) : null}
      <div
        aria-label={copy.spamProtection}
        className={isLoading ? 'hidden' : 'block'}
        ref={containerRef}
      />
    </div>
  );
}
