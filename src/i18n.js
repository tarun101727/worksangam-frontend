// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

// List all your language codes
const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

// Preload all languages
const loadAllLanguages = async () => {
  const resources = { en: { translation: en } };

  await Promise.all(
    languages.map(async (lang) => {
      if (lang === "en") return; // English is already imported
      try {
        const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
        if (!res.ok) throw new Error("Failed to fetch language");
        const data = await res.json();
        resources[lang] = { translation: data };
      } catch (err) {
        console.error(`Failed to load ${lang}:`, err);
      }
    })
  );

  // Initialize i18n
  i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("lang") || "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
};

loadAllLanguages(); // load all at startup
export default i18n;
