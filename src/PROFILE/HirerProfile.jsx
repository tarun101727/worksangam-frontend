import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileRow from "./ProfileRow";
import { useTranslation } from "react-i18next";


const HirerProfile = ({ user: initialUser, token }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser || {});
  const { t } = useTranslation();

  useEffect(() => {
  const fetchPostStats = async () => {
    try {
      const res = await axios.get("/api/post-stats/hirer-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser((prev) => ({
        ...prev,
        totalPosts: res.data.totalPosts,
        urgentPosts: res.data.totalUrgentPosts,
      }));
    } catch (err) {
      console.error("Failed to fetch post stats:", err);
    }
  };

  fetchPostStats();
}, [token]);

  return (
    <div className="max-w-xl mx-auto space-y-8 text-white">
      {/* ---------------- HIRER INFO BOX ---------------- */}
        
        <div className="grid grid-cols-2 gap-4">
  <ProfileRow label={t("age")} value={user.age || "-"} />
  <ProfileRow label={t("gender")} value={t("user.gender") || "-"} />
</div>
        {user.bio && <p className="mt-2 text-sm text-white/70">{user.bio}</p>}

      {/* ---------------- OFFLINE POSTS ---------------- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("Offline Posts")}</h3>
        <div className="flex flex-col sm:flex-row gap-4" >
          <button
            onClick={() => navigate("/Offline/create-post")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-2"
          >
            📍 {t("Offline Worker Post")}
          </button>

          <button
            onClick={() => navigate("/Hirer/Urgent")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-red-600 hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2"
          >
            ⚡ {t("Urgent Offline Post")}
          </button>
        </div>
      </div>

      {/* ---------------- ONLINE POSTS ---------------- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{t("Online Posts")}</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/Online/create-post")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2"
          >
            🌐 {t("Online Worker Post")}
          </button>

          <button
            onClick={() => navigate("/hirer-online-urgent-post")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base bg-yellow-600 hover:bg-yellow-700 transition shadow-md flex items-center justify-center gap-2"
          >
            🚀 {t("Urgent Online Post")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HirerProfile;
