import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n.js"; // import i18n

export default function HirerDelete() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { t } = useTranslation();

  // For translation
  const translateTimer = useRef(null);
  const latestTypedValue = useRef("");

  useEffect(() => {
  // simulate small delay OR wait for any future API
  setTimeout(() => {
    setPageLoading(false);
  }, 300); // smooth UX
}, []);

  const translateText = async (text) => {
    const lang = i18n.language || "en";
    if (lang === "en") return;

    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      const data = await res.json();

      let translated = data[0].map((item) => item[0]).join("");

      // preserve trailing spaces
      const trailingSpaces = text.match(/\s+$/);
      if (trailingSpaces) {
        translated += trailingSpaces[0];
      }

      // prevent overwrite
      if (latestTypedValue.current !== text) return;

      setDescription(translated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDescriptionChange = (value) => {
    latestTypedValue.current = value;
    setDescription(value);

    const lang = i18n.language || "en";
    if (lang === "en") return;

    clearTimeout(translateTimer.current);
    translateTimer.current = setTimeout(() => {
      if (latestTypedValue.current !== value) return;
      translateText(value);
    }, 800);
  };

  const deleteAccount = async () => {
    if (!reason) {
      alert(t("Please select a reason"));
      return;
    }

    if (!window.confirm(t("Are you sure you want to permanently delete your account?"))) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${BASE_URL}/api/auth/delete-account`, {
        withCredentials: true,
        data: { reason, description },
      });

      alert(t("Account deleted"));
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.msg || t("Error deleting account"));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red-400">{t("Delete Your Account")}</h1>
      <p className="text-gray-300 mb-6">{t("deleted_description")}</p>

      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-2">{t("Warning")}</h2>
        <ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">
          <li>{t("Your account will be permanently deleted.")}</li>
          <li>{t("Your uploaded content and profile data will be removed.")}</li>
          <li>{t("Your ratings and reviews will disappear.")}</li>
          <li>{t("You cannot recover your account after deletion.")}</li>
          <li>{t("You must create a new account to use the platform again.")}</li>
        </ul>
      </div>

      <h2 className="font-semibold mb-2">{t("Why are you deleting your account?")}</h2>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full p-3 bg-[#111827] rounded-xl border border-white/10 mb-4"
      >
        <option value="">{t("Select reason")}</option>
        <option value="privacy">{t("Privacy concerns")}</option>
        <option value="not_useful">{t("Service not useful")}</option>
        <option value="found_better">{t("Found better platform")}</option>
        <option value="temporary_leave">{t("Temporary break")}</option>
        <option value="technical_problem">{t("Technical problems")}</option>
        <option value="other">{t("Other")}</option>
      </select>

      <textarea
        placeholder={t("Optional feedback (helps us improve)")}
        value={description}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        className="w-full p-3 bg-[#111827] rounded-xl border border-white/10 mb-6 h-28"
      />

      <button
        onClick={deleteAccount}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-semibold"
      >
        {loading ? t("Deleting...") : t("Delete My Account")}
      </button>
    </div>
  );
}
