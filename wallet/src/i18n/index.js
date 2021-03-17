import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import vn from './locales/vn.json';

i18n.use(LanguageDetector).init({
  // we init with resources
  resources: {
    en: { wallet: en },
    vn: { wallet: vn }
  },
  fallbackLng: 'en',
  debug: true,

  // have a common namespace used around the full app
  ns: ['wallet'],
  defaultNS: 'wallet',

  keySeparator: false, // we use content as keys

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ','
  },

  react: {
    wait: true
  }
});

export default i18n;
