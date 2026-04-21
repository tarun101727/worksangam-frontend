import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Logout(){

const navigate = useNavigate();
const [loading,setLoading] = useState(false);
    const { t } = useTranslation();

const logoutUser = async () => {
  if (!window.confirm("Are you sure you want to logout?")) {
    return;
  }

  try {
    setLoading(true);

    await axios.post(
      `${BASE_URL}/api/auth/logout`,
      {},
      { withCredentials: true }
    );

    alert("Logged out successfully");

    // ✅ ADD THIS
    localStorage.clear();
    sessionStorage.clear();

    navigate("/");
    window.location.reload(); // 🔥 IMPORTANT

  } catch (err) {
    alert(err?.response?.data?.msg || "Logout failed");
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

return(

<div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">

<h1 className="text-2xl font-bold mb-4 text-yellow-400">
{t("Logout")}
</h1>

<p className="text-gray-300 mb-6">
{t("log_description")}
</p>

<div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">

<h2 className="font-semibold mb-2">{t("What happens when you logout?")}</h2>

<ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">

<li>{t("Your session will be closed.")}</li>

<li>{t("You will be signed out from this device.")}</li>

<li>{t("Your account and data will remain safe.")}</li>

<li>{t("You can log in again anytime.")}</li>

</ul>

</div>

<div className="flex gap-4">

<button
onClick={logoutUser}
disabled={loading}
className="flex-1 bg-yellow-600 hover:bg-yellow-700 p-3 rounded-xl font-semibold"
>
{t("Logout")}
</button>

<button
onClick={()=>navigate("/settings")}
className="flex-1 bg-[#111827] border border-white/10 p-3 rounded-xl"
>
{t("More")}
</button>

</div>

</div>

);
}
