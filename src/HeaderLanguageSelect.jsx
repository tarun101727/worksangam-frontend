import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { i18n: i18nInstance } = useTranslation(); // ← important
  const [open, setOpen] = useState(false);

  const changeLanguage = (code) => {
    i18nInstance.changeLanguage(code); // triggers re-render
    localStorage.setItem("lang", code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700"
      >
        {(i18nInstance.language || "en").toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
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
