import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import { BASE_URL } from "./config";

const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

const savedLang = localStorage.getItem("lang") || "en";

// ✅ Initialize i18next with English fully loaded
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } }, // English fully registered here
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// ✅ Dynamically load other languages
languages.forEach(async (lang) => {
  if (lang === "en") return; // skip English
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
