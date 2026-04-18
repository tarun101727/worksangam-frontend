// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

// List all language codes
const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

// ✅ Step 1: Get saved language
const savedLang = localStorage.getItem("lang") || "en";

// ✅ Step 2: Initialize i18n immediately with saved language
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } }, // English loaded immediately
  lng: savedLang,                         // Use saved language right away
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// ✅ Step 3: Load other languages asynchronously
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
