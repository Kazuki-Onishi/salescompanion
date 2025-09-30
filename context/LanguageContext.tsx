import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';

// Since we are fetching JSON at runtime, we can't statically infer keys from the import.
// We'll use a generic string type for keys. For stronger type safety in a larger app,
// one might use a code generation step to create a precise type from the en.json file.
type TranslationKey = string; 

type Language = 'en' | 'ja';
type Translations = Record<Language, Record<TranslationKey, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ja',
  setLanguage: () => console.warn('LanguageProvider not found'),
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, jaResponse] = await Promise.all([
          fetch('./locales/en.json'),
          fetch('./locales/ja.json')
        ]);
        if (!enResponse.ok || !jaResponse.ok) {
            throw new Error('Failed to load translation files');
        }
        const enData = await enResponse.json();
        const jaData = await jaResponse.json();
        
        if (typeof enData !== 'object' || enData === null || typeof jaData !== 'object' || jaData === null) {
          throw new Error('Invalid translation file format');
        }

        setTranslations({ en: enData, ja: jaData });
      } catch (error) {
        console.error("Could not load translations:", error);
      }
    };

    fetchTranslations();
  }, []);

  const value = useMemo(() => {
    const t = (key: TranslationKey, options?: { [key: string]: string | number }): string => {
      if (!translations) {
        return key; // Return the key itself as a fallback if translations aren't loaded
      }
      
      let template = translations[language]?.[key] || translations['en'][key] || key;
      
      if (options) {
        for (const [optionKey, optionValue] of Object.entries(options)) {
          template = template.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(optionValue));
        }
      }
      
      return template;
    };

    return { language, setLanguage, t };
  }, [language, translations]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  // The context is now always provided, but we keep the check for robustness
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
