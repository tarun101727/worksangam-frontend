// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

const loadLanguage = async (lang) => {
  if (lang === "en") return en;

  try {
    const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
    if (!res.ok) throw new Error("Failed to fetch language");
    return await res.json();
  } catch (err) {
    console.error("Language fetch failed:", err);
    return en;
  }
};

// Read saved language from localStorage or fallback
const savedLang = localStorage.getItem("lang") || "en";

const initI18n = async () => {
  const translations = await loadLanguage(savedLang);

  const resources = {
    en: { translation: en },
    [savedLang]: { translation: translations },
  };

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

initI18n(); // initialize
export default i18n;
