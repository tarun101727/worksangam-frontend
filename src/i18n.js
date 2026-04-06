import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

const fetchLanguage = async (lang) => {
  if (lang === "en") return en;

  try {
    const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
    if (!res.ok) return en;

    const translations = await res.json(); // ✅ this will now return the translations object
    return translations;
  } catch {
    return en;
  }
};

const savedLang = localStorage.getItem("lang") || "en";

(async () => {
  const resources = {
    en: { translation: en },
    [savedLang]: { translation: await fetchLanguage(savedLang) },
  };

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
})();

export default i18n;
