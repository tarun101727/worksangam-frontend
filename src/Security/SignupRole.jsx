import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


const SignupRole = () => {
  const navigate = useNavigate();
const { t } = useTranslation();
  const roleCard =
    "w-full p-5 rounded-2xl text-left text-white " +
    "bg-[#111827] border border-white/10 " +
    "cursor-pointer mb-4 " +
    "transition-all duration-300 " +
    "hover:bg-[#1F2937] hover:border-[#6366F1]/40 " +
    "hover:shadow-lg hover:shadow-[#6366F1]/20 " +
    "active:scale-95";

  return (
    /* 🔹 Small screen: start from top
       🔹 Large screen: centered (unchanged) */
    <div className="
      min-h-screen px-4
      flex items-start justify-start pt-6
      sm:items-center sm:justify-center sm:pt-0
    ">
      <div
        className="
          mx-auto w-full max-w-md
          rounded-none sm:rounded-3xl
          p-4 sm:p-8
          text-center transition-all duration-500

          /* ❌ Small screen: no popup look */
          bg-transparent border-none shadow-none backdrop-blur-0

          /* ✅ Large screen: popup look (unchanged) */
          sm:bg-[#0F172A]/90 sm:backdrop-blur-2xl
          sm:border sm:border-white/10
          sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
        "
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          {t("Create your account")}
        </h2>

        <p className="text-white/70 mb-8">
          {t("Choose how you want to use the platform")}
        </p>

        {/* Worker */}
        <div
          className={roleCard}
          onClick={() =>
            navigate("/signup/Email", { state: { role: "employee" } })
          }
        >
          <h3 className="text-xl font-semibold">{t("👷 Worker")}</h3>
          <p className="text-sm mt-1 text-white/70">
            {t("Offer your services, set your price, get hired nearby")}
          </p>
        </div>

        {/* Hirer */}
        <div
          className={roleCard}
          onClick={() =>
            navigate("/signup/Email", { state: { role: "hirer" } })
          }
        >
          <h3 className="text-xl font-semibold">🧑‍💼 {t("Hirer")}</h3>
          <p className="text-sm mt-1 text-white/70">
            {t("Find trusted, top-rated workers near you")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupRole;
