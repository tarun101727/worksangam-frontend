import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "./config";

const languages = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिन्दी" },
  { code: "as", label: "অসমীয়া" },
  { code: "bn", label: "বাংলা" },
  { code: "brx", label: "बड़ो" },
  { code: "doi", label: "डोगरी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ks", label: "कश्मीरी" },
  { code: "kok", label: "कोंकणी" },
  { code: "mai", label: "मैथिली" },
  { code: "ml", label: "മലയാളം" },
  { code: "mni", label: "মৈতৈলোন্" },
  { code: "mr", label: "मराठी" },
  { code: "ne", label: "नेपाली" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "sa", label: "संस्कृतम्" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd", label: "सिंधी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ur", label: "اُردُو" },
];

export default function HeaderLanguageSelect() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loadingLang, setLoadingLang] = useState(false);

  // Find label for currently selected language
  const currentLanguageLabel =
    languages.find((lang) => lang.code === i18n.language)?.label || "English";

  const changeLanguage = async (code) => {
    if (loadingLang) return; // prevent multiple clicks
    setLoadingLang(true);

    try {
      // Load language dynamically if not already loaded
      if (code !== "en" && !i18n.hasResourceBundle(code, "translation")) {
        const res = await fetch(`${BASE_URL}/api/languages/${code}`);
        if (res.ok) {
          const data = await res.json();
          i18n.addResourceBundle(code, "translation", data, true, true);
        }
      }

      // Switch language
      await i18n.changeLanguage(code);

      // Save to localStorage
      localStorage.setItem("lang", code);
    } catch (err) {
      console.error("Failed to change language:", err);
    } finally {
      setOpen(false);
      setLoadingLang(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 flex items-center justify-between w-28"
      >
        <span>{currentLanguageLabel}</span>
        {loadingLang && (
          <span className="ml-2 animate-spin border-b-2 border-white rounded-full w-3 h-3"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm"
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
