// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

const savedLang = localStorage.getItem("lang") || "en";

// Step 1: Init i18n with English resources
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Step 2: Dynamically load other languages safely
async function loadOtherLanguages() {
  for (const lang of languages) {
    if (lang === "en") continue;
    try {
      const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
      if (!res.ok) throw new Error("Failed to fetch language");
      const data = await res.json();
      i18n.addResourceBundle(lang, "translation", data, true, true);
    } catch (err) {
      console.error(`Failed to load ${lang}:`, err);
    }
  }
}

// call it but don’t await top-level
loadOtherLanguages();

export default i18n;
