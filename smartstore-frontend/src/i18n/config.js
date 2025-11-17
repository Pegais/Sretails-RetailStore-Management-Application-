import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'

// Language detection configuration
const languageDetectorOptions = {
  // Order of detection methods
  order: ['localStorage', 'navigator', 'htmlTag'],
  
  // Keys to lookup language from
  lookupLocalStorage: 'i18nextLng',
  lookupSessionStorage: 'i18nextLng',
  
  // Cache user language
  caches: ['localStorage'],
  
  // Exclude cache for these languages
  excludeCacheFor: ['cimode'],
  
  // Convert detected language to i18n format (e.g., 'en-IN' -> 'en', 'hi-IN' -> 'hi')
  convertDetectedLanguage: (lng) => {
    // If language is Hindi or starts with 'hi', return 'hi'
    if (lng && (lng.startsWith('hi') || lng === 'hi')) {
      return 'hi'
    }
    // Default to English
    return 'en'
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      hi: {
        translation: hiTranslations,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'translation',
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: languageDetectorOptions,
  })

export default i18n

