// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json"; // keep this
import { BASE_URL } from "./config";

const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

const savedLang = localStorage.getItem("lang") || "en";

// Step 1: Register English immediately
const resources = { en: { translation: en } };

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Step 2: Dynamically load all other languages
async function loadOtherLanguages() {
  for (const lang of languages) {
    if (lang === "en") continue; // skip English
    if (!i18n.hasResourceBundle(lang, "translation")) {
      try {
        const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
        if (!res.ok) throw new Error(`Failed to fetch ${lang}`);
        const data = await res.json();
        i18n.addResourceBundle(lang, "translation", data, true, true);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// call it but don't await top-level
loadOtherLanguages();

export default i18n;
