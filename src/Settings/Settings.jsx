import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Settings() {
    const { t } = useTranslation();
const [user,setUser] = useState(null);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
  axios.get(`${BASE_URL}/api/auth/get-current-user`, {
    withCredentials: true
  })
  .then(res => {
    setUser(res.data.user);
  })
  .catch(() => {})
  .finally(() => {
    setLoading(false); // ✅ ADD THIS
  });
}, []);

if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

return(
<div className="min-h-screen text-white px-4 py-6">

<h1 className="text-2xl font-bold mb-6">{t("Settings")}</h1>

<div className="space-y-4">
<button
onClick={()=>navigate("/payment-success")}
className="w-full text-left p-4 bg-green-900/30 rounded-xl border border-green-500/20"
>
{t("Buy Credits")} 💳
</button>
<button
onClick={()=>navigate("/settings/account")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
{t("Account Information")}
</button>

<button
onClick={()=>navigate("/settings/Email")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
{t("Change Email Address")}
</button>

<button
onClick={()=>navigate("/settings/Password")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
{t("Change Password")}
</button>


<button
onClick={()=>navigate("/settings/logout")}
className="w-full text-left p-4 bg-yellow-900/30 rounded-xl border border-yellow-500/20"
>
{t("Logout")}
</button>

<button
onClick={()=>navigate("/settings/delete")}
className="w-full text-left p-4 bg-red-900/30 rounded-xl border border-red-500/20"
>
{t("Delete Account")}
</button>

</div>

</div>
);
}
