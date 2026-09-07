import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hu from './locales/hu.json'

const stored = (() => {
  try {
    return localStorage.getItem('mathvis-lang')
  } catch {
    return null
  }
})()
const fromUrl = new URLSearchParams(window.location.search).get('lang')

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hu: { translation: hu } },
  lng: fromUrl === 'en' || fromUrl === 'hu' ? fromUrl : stored === 'en' || stored === 'hu' ? stored : 'hu',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('mathvis-lang', lng)
  } catch {
    /* private mode etc. */
  }
  document.documentElement.lang = lng
})

export default i18n
