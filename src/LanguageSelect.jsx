import i18n from "./i18n"; 
import { useNavigate } from "react-router-dom";

const LanguageSelect = () => {
  const navigate = useNavigate();

  const handleLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);

    // after selecting → go to signup
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl mb-6">Select Language</h1>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => handleLanguage("en")}>English</button>
        <button onClick={() => handleLanguage("te")}>తెలుగు</button>
      </div>
    </div>
  );
};

export default LanguageSelect;
