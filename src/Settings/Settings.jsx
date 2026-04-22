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

  // 🔹 Common Button Style
  const baseBtn =
    "w-full text-left p-4 rounded-xl border transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]";

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

  // 🔹 Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0f172a]">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 py-6 bg-[#0f172a]">
      <h1 className="text-2xl font-bold mb-6">{t("Settings")}</h1>

      <div className="space-y-4">

        {/* Buy Credits */}
        <button
          onClick={() => navigate("/payment-success")}
          className={`${baseBtn} bg-green-900/30 border-green-500/20 hover:bg-green-800/40 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-500/10`}
        >
          {t("Buy Credits")} 💳
        </button>

        {/* Payment History */}
        <button
          onClick={() => navigate("/payments-history")}
          className={`${baseBtn} bg-blue-900/30 border-blue-500/20 hover:bg-blue-800/40 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10`}
        >
          {t("Payment History")}
        </button>

        {/* Account Info */}
        <button
          onClick={() => navigate("/settings/account")}
          className={`${baseBtn} bg-[#111827] border-white/10 hover:bg-[#1f2937] hover:border-white/20 hover:shadow-md`}
        >
          {t("Account Information")}
        </button>

        {/* Change Email */}
        <button
          onClick={() => navigate("/settings/Email")}
          className={`${baseBtn} bg-[#111827] border-white/10 hover:bg-[#1f2937] hover:border-white/20 hover:shadow-md`}
        >
          {t("Change Email Address")}
        </button>

        {/* Change Password */}
        <button
          onClick={() => navigate("/settings/Password")}
          className={`${baseBtn} bg-[#111827] border-white/10 hover:bg-[#1f2937] hover:border-white/20 hover:shadow-md`}
        >
          {t("Change Password")}
        </button>

        {/* Logout */}
        <button
          onClick={() => navigate("/settings/logout")}
          className={`${baseBtn} bg-yellow-900/30 border-yellow-500/20 hover:bg-yellow-800/40 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-500/10`}
        >
          {t("Logout")}
        </button>

        {/* Delete Account */}
        <button
          onClick={() => navigate("/settings/delete")}
          className={`${baseBtn} bg-red-900/30 border-red-500/20 hover:bg-red-800/40 hover:border-red-400/40 hover:shadow-lg hover:shadow-red-500/10`}
        >
          {t("Delete Account")}
        </button>

      </div>
    </div>
  );
}
