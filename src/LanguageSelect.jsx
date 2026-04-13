import i18n from "./i18n";
import { useNavigate } from "react-router-dom";

const LanguageSelect = () => {
  const navigate = useNavigate();

  const handleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    navigate("/signup");
  };

  const languages = [
    { code: "en", label: "English (English)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "as", label: "অসমীয়া (Assamese)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "brx", label: "बड़ो (Bodo)" },
    { code: "doi", label: "डोगरी (Dogri)" },
    { code: "gu", label: "ગુજરાતી (Gujarati)" },
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "ks", label: "कश्मीरी (Kashmiri)" },
    { code: "kok", label: "कोंकणी (Konkani)" },
    { code: "mai", label: "मैथिली (Maithili)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "mni", label: "মৈতৈলোন্ (Manipuri)" },
    { code: "mr", label: "मराठी (Marathi)" },
    { code: "ne", label: "नेपाली (Nepali)" },
    { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
    { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
    { code: "sa", label: "संस्कृतम् (Sanskrit)" },
    { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ (Santali)" },
    { code: "sd", label: "सिंधी (Sindhi)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "ur", label: "اُردُو (Urdu)" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white px-4">
      <div className="bg-[#0F172A]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-lg text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-3 tracking-wide">
          🌐 Select Language
        </h1>

        <p className="text-gray-400 mb-6 text-sm">
          Choose your preferred language to continue
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguage(lang.code)}
              className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 font-medium text-sm sm:text-base"
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          You can change language anytime later
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;
