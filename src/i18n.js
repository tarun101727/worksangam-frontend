import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json"; // full en.json
import { BASE_URL } from "./config";

const languages = [
  "en","te","hi","as","bn","brx","doi","gu","kn","ks","kok",
  "mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","ur"
];

const savedLang = localStorage.getItem("lang") || "en";

// 1️⃣ Initialize i18next with **full English bundle**
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } }, // full en.json
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// 2️⃣ Force English bundle in case dynamic loader overwrites
if (!i18n.hasResourceBundle("en", "translation")) {
  i18n.addResourceBundle("en", "translation", en, true, true);
  console.log("Force added full English bundle", Object.keys(en));
}

// 3️⃣ Load other languages dynamically, but skip overwriting English
async function loadOtherLanguages() {
  for (const lang of languages) {
    if (lang === "en") continue; // never overwrite English
    if (!i18n.hasResourceBundle(lang, "translation")) {
      try {
        const res = await fetch(`${BASE_URL}/api/languages/${lang}`);
        if (!res.ok) throw new Error(`Failed to fetch ${lang}`);
        const data = await res.json();
        i18n.addResourceBundle(lang, "translation", data, true, true);
        console.log(`Loaded language ${lang}`, Object.keys(data));
      } catch (err) {
        console.error(`Failed to load ${lang}:`, err);
      }
    }
  }
}

// Call async loader, don't await top-level
loadOtherLanguages();

export default i18n;
