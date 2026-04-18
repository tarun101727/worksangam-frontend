import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

const savedLang = localStorage.getItem("lang") || "en";

// ✅ Step 1: Fully register English resources
const resources = { en: { translation: en } };

// ✅ Step 2: Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// ✅ Step 3: Load other languages dynamically (skip English)
languages.forEach(async (lang) => {
  if (lang === "en") return;
  try {
    const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
    if (!res.ok) throw new Error("Failed to fetch language");
    const data = await res.json();
    i18n.addResourceBundle(lang, "translation", data, true, true);
  } catch (err) {
    console.error(`Failed to load ${lang}:`, err);
  }
});

export default i18n;
