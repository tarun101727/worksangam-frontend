import i18n from "./i18n";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./config"; // make sure this exists

const LanguageSelect = () => {
  const navigate = useNavigate();

  const handleLanguage = async (lang) => {
    try {
      // ✅ 1. Change UI language
      await i18n.changeLanguage(lang);

      // ✅ 2. Save locally
      localStorage.setItem("lang", lang);

      // ✅ 3. SAVE IN DATABASE (🔥 IMPORTANT)
      await axios.put(
        `${BASE_URL}/api/auth/update-language`,
        { language: lang },
        { withCredentials: true } // ⚠️ IMPORTANT for cookies auth
      );

      // ✅ 4. Navigate
      navigate("/signup");

    } catch (err) {
      console.error("Language change failed", err);
    }
  };
