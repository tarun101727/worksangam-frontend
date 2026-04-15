// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

// Load translation JSON for a language from backend
const fetchLanguage = async (lang) => {
  if (lang === "en") return en;
  try {
    const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
    if (!res.ok) return en;
    return await res.json();
  } catch {
    return en;
  }
};

i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Override changeLanguage to wait for translations
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lang) => {
  if (!i18n.hasResourceBundle(lang, "translation")) {
    const translations = await fetchLanguage(lang);
    i18n.addResourceBundle(lang, "translation", translations, true, true);
  }
  return originalChangeLanguage(lang);
};

// Wait for initial language to load
i18n.ready = async () => {
  const lang = localStorage.getItem("lang") || "en";
  if (!i18n.hasResourceBundle(lang, "translation")) {
    const translations = await fetchLanguage(lang);
    i18n.addResourceBundle(lang, "translation", translations, true, true);
  }
  return lang;
};

export default i18n;
