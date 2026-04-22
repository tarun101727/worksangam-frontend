import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/get-current-user`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 py-6 bg-gradient-to-br from-black via-gray-900 to-black">
      
      {/* Title */}
      <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">
        {t("Settings")}
      </h1>

      {/* Card Container */}
      <div className="space-y-4 max-w-xl mx-auto">

        {/* Credits */}
        <button
          onClick={() => navigate("/payment-success")}
          className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition duration-300 shadow-md"
        >
          💳 {t("Buy Credits")}
        </button>

        <button
          onClick={() => navigate("/payments-history")}
          className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition duration-300 shadow-md"
        >
          📊 {t("Payment History")}
        </button>

        {/* Account */}
        <button
          onClick={() => navigate("/settings/account")}
          className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 shadow-md"
        >
          👤 {t("Account Information")}
        </button>

        <button
          onClick={() => navigate("/settings/Email")}
          className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 shadow-md"
        >
          📧 {t("Change Email Address")}
        </button>

        <button
          onClick={() => navigate("/settings/Password")}
          className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300 shadow-md"
        >
          🔒 {t("Change Password")}
        </button>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-white/10 space-y-4">

          <button
            onClick={() => navigate("/settings/logout")}
            className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition duration-300 shadow-md"
          >
            ⚠️ {t("Logout")}
          </button>

          <button
            onClick={() => navigate("/settings/delete")}
            className="w-full text-left p-4 rounded-2xl backdrop-blur-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition duration-300 shadow-md"
          >
            ❌ {t("Delete Account")}
          </button>

        </div>
      </div>
    </div>
  );
}
