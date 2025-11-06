import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: {
    translation: en
  },
  he: {
    translation: he
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: !window.location.hostname.includes('replit.app'),
    
    // Log missing translation keys in development
    missingKeyHandler: (lngs: readonly string[], ns: string, key: string, fallbackValue: string, updateMissing: boolean, options: any) => {
      if (!window.location.hostname.includes('replit.app')) {
        console.warn(`Missing translation key: ${lngs[0]}.${ns}.${key}`, {
          languages: lngs,
          namespace: ns,
          key: key,
          fallback: fallbackValue,
          updateMissing
        });
      }
    },

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      // Add cookie support as fallback
      lookupCookie: 'i18next',
    },

    // Set up locale change handler for date formatting
    react: {
      useSuspense: false
    }
  });

// Ensure language is persisted and RTL is set on initialization
i18n.on('initialized', () => {
  // Normalize the language to 'en' or 'he' only
  let currentLang = i18n.language;
  
  // If language is something like 'en-US', 'en-GB', normalize to 'en'
  if (currentLang.startsWith('en')) {
    currentLang = 'en';
  } else if (currentLang.startsWith('he')) {
    currentLang = 'he';
  } else {
    // Default to English for any other language
    currentLang = 'en';
  }
  
  // If normalized language is different from current, change it
  if (currentLang !== i18n.language) {
    i18n.changeLanguage(currentLang);
  }
  
  document.documentElement.dir = currentLang === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
  
  // Ensure it's saved to localStorage
  localStorage.setItem('i18nextLng', currentLang);
  
  console.log('i18n initialized with language:', currentLang);
});

// Update RTL on language change
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  // Ensure language is saved to localStorage
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;