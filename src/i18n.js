import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de.js';
import en from './locales/en.js';
import uk from './locales/uk.js';
import zh from './locales/zh.js';

// The site must ALWAYS open in German by default.
// Older builds auto-detected the visitor's browser language and cached it,
// which made the site load in Ukrainian/Russian/etc. and ignore the German
// default. We now only honour a language the visitor picked themselves via
// the switcher (flagged by `langManuallySet`). This also clears any stale
// auto-detected value left in a returning visitor's browser.
try {
  if (!localStorage.getItem('langManuallySet')) {
    localStorage.removeItem('i18nextLng');
  }
} catch {
  /* localStorage unavailable (private mode) — ignore */
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
      uk: { translation: uk },
      zh: { translation: zh },
    },
    supportedLngs: ['de', 'en', 'uk', 'zh'],
    fallbackLng: 'de',
    load: 'languageOnly', // treat de-DE / uk-UA as de / uk
    detection: {
      // Only manual signals — never the browser's system language.
      order: ['querystring', 'localStorage'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;
