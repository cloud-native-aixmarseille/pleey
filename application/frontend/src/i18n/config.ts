import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import { LANGUAGE_STORAGE_KEY } from "../domains/shared/constants/storageKeys";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

// Get language from localStorage or use browser language
const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const browserLanguage = navigator.language.split("-")[0];
const defaultLanguage =
  savedLanguage || (browserLanguage === "fr" ? "fr" : "en");

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
