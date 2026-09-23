import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { PublicLanguage } from '@/services/public-content';

type PublicLanguageContextValue = {
  language: PublicLanguage;
  setLanguage: (language: PublicLanguage) => void;
};

const PublicLanguageContext = createContext<PublicLanguageContextValue | undefined>(undefined);
export const publicLanguageStorageKey = 'arunreah-public-language';

export function storedPublicLanguage(value: string | null): PublicLanguage | undefined {
  return value === 'en' || value === 'km' ? value : undefined;
}

export function initialPublicLanguage(storedValue: string | null | undefined, documentLanguage?: string): PublicLanguage {
  return storedPublicLanguage(storedValue ?? null) ?? (documentLanguage?.toLowerCase().startsWith('km') ? 'km' : 'en');
}

function readStoredLanguage(): PublicLanguage | undefined {
  try {
    return storedPublicLanguage(window.localStorage.getItem(publicLanguageStorageKey));
  } catch {
    return undefined;
  }
}

export function PublicLanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<PublicLanguage>(
    () => initialPublicLanguage(readStoredLanguage(), typeof document !== 'undefined' ? document.documentElement.lang : 'en'),
  );

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(publicLanguageStorageKey, language);
    } catch {
      // Private browsing or browser policy can block storage; English remains the safe default on reload.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <PublicLanguageContext.Provider value={value}>{children}</PublicLanguageContext.Provider>;
}

export function usePublicLanguage() {
  const context = useContext(PublicLanguageContext);
  if (!context) throw new Error('usePublicLanguage must be used within PublicLanguageProvider.');
  return context;
}
