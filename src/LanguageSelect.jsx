import i18n from "./i18n";
import { useNavigate } from "react-router-dom";

const LanguageSelect = () => {
  const navigate = useNavigate();

  const handleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);

    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white px-4">
      <div className="bg-[#0F172A]/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 tracking-wide">
          🌐 Select Language
        </h1>

        <p className="text-gray-400 mb-6 text-sm">
          Choose your preferred language to continue
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleLanguage("en")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            English (English)
          </button>

          <button
            onClick={() => handleLanguage("te")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            తెలుగు (Telugu)
          </button>

          <button
            onClick={() => handleLanguage("hi")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            हिन्दी (Hindi)
          </button>

          <button
            onClick={() => handleLanguage("as")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            অসমীয়া (Assamese)
          </button>

          <button
            onClick={() => handleLanguage("bn")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            বাংলা (Bengali)
          </button>

          <button
            onClick={() => handleLanguage("brx")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            बड़ो (Bodo)
          </button>

          <button
            onClick={() => handleLanguage("doi")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            डोगरी (Dogri)
          </button>

          <button
            onClick={() => handleLanguage("gu")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            ગુજરાતી (Gujarati)
          </button>

          <button
            onClick={() => handleLanguage("kn")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            ಕನ್ನಡ (Kannada)
          </button>

          <button
            onClick={() => handleLanguage("ks")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            कश्मीरी (Kashmiri)
          </button>

          <button
            onClick={() => handleLanguage("kok")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            कोंकणी (Konkani)
          </button>

          <button
            onClick={() => handleLanguage("mai")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            मैथिली (Maithili)
          </button>

          <button
            onClick={() => handleLanguage("ml")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            മലയാളം (Malayalam)
          </button>

          <button
            onClick={() => handleLanguage("mni")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            মৈতৈলোন্ (Manipuri)
          </button>

          <button
            onClick={() => handleLanguage("mr")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            मराठी (Marathi)
          </button>

          <button
            onClick={() => handleLanguage("ne")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            नेपाली (Nepali)
          </button>

          <button
            onClick={() => handleLanguage("or")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            ଓଡ଼ିଆ (Odia)
          </button>

          <button
            onClick={() => handleLanguage("pa")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            ਪੰਜਾਬੀ (Punjabi)
          </button>

          <button
            onClick={() => handleLanguage("sa")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            संस्कृतम् (Sanskrit)
          </button>

          <button
            onClick={() => handleLanguage("sat")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            ᱥᱟᱱᱛᱟᱲᱤ (Santali)
          </button>

          <button
            onClick={() => handleLanguage("sd")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            सिंधी (Sindhi)
          </button>

          <button
            onClick={() => handleLanguage("ta")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            தமிழ் (Tamil)
          </button>

          <button
            onClick={() => handleLanguage("ur")}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all duration-200 shadow-md hover:scale-105 font-medium"
          >
            اُردُو (Urdu)
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          You can change language anytime later
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;
