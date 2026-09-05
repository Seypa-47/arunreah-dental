import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { PublicLanguage } from '@/services/public-content';

type PublicLanguageContextValue = {
  language: PublicLanguage;
  setLanguage: (language: PublicLanguage) => void;
};

const PublicLanguageContext = createContext<PublicLanguageContextValue | undefined>(undefined);

export function PublicLanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<PublicLanguage>(() =>
    document.documentElement.lang.toLowerCase().startsWith('km') ? 'km' : 'en',
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <PublicLanguageContext.Provider value={value}>{children}</PublicLanguageContext.Provider>;
}

export function usePublicLanguage() {
  const context = useContext(PublicLanguageContext);
  if (!context) throw new Error('usePublicLanguage must be used within PublicLanguageProvider.');
  return context;
}
