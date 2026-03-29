import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAuth } from "../useAuth.js";
import { useEffect } from "react";

const SignupOptions = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const continueAsGuest = async () => {
    const res = await axios.post(
      `${BASE_URL}/api/auth/guest`,
      {},
      { withCredentials: true }
    );
    setIsAuthenticated(true);
    setUser({ ...res.data.user, isGuest: true });
    navigate("/home");
  };

  /* Weglot Initialization */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.weglot.com/weglot.min.js";
    script.async = true;
    script.onload = () => {
      if (window.Weglot) {
        window.Weglot.initialize({
          api_key: "wg_458091468a353aac24b94996166c65169",
          originalLanguage: "en",
          destinationLanguages: ["hi", "te", "fr", "es"],
        });
      }
    };
    document.body.appendChild(script);
    
    // Optional cleanup if component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* 🔥 THEME — CHARCOAL + INDIGO */
  const buttonPrimary =
    "w-full py-4 sm:py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95";

  const buttonSecondary =
    "w-full py-4 sm:py-3 rounded-xl font-semibold text-white " +
    "bg-[#111827] border border-white/10 " +
    "transition-all duration-300 " +
    "hover:bg-[#1F2937] hover:border-white/20 " +
    "hover:shadow-md hover:shadow-black/50 " +
    "active:scale-95";

  const buttonOutline =
    "w-full py-4 sm:py-3 rounded-xl font-semibold text-[#818CF8] " +
    "border border-[#818CF8]/40 " +
    "transition-all duration-300 " +
    "hover:bg-[#6366F1]/15 hover:text-white " +
    "hover:shadow-md hover:shadow-[#6366F1]/30 " +
    "active:scale-95";

  return (
    <div className="min-h-screen flex items-start lg:items-center justify-center pt-8 sm:pt-12 lg:pt-0 px-4 sm:px-6 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] lg:bg-none">
      <div className="w-full max-w-sm md:max-w-md text-center flex flex-col min-h-screen lg:min-h-0 lg:rounded-3xl lg:bg-[#0F172A]/90 lg:backdrop-blur-2xl lg:border lg:border-white/10 lg:p-8 p-0 lg:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-500">
        <h1 className="text-4xl font-bold tracking-wide text-white mb-3 mt-8 lg:mt-0">
          GUILDS
        </h1>
        <p className="text-sm text-white/70 mb-10 leading-relaxed px-2 lg:px-0">
          Get started in seconds — create an account or explore as a guest.
        </p>

        <div className="flex flex-col gap-6 px-2 lg:px-0">
          <button onClick={() => navigate("/signup/role")} className={buttonPrimary}>
            Sign up
          </button>

          <button onClick={continueAsGuest} className={buttonSecondary}>
            Continue as Guest
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/50 uppercase tracking-wider">
              Already have an account?
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={() => navigate("/login")} className={buttonOutline}>
            Login
          </button>
        </div>

        <p className="mt-10 text-[11px] text-white/50 leading-relaxed px-3 lg:px-0">
          By continuing, you agree to our{" "}
          <button
            onClick={() => navigate("/terms")}
            className="text-[#818CF8] hover:underline underline-offset-2 transition"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            onClick={() => navigate("/privacy")}
            className="text-[#818CF8] hover:underline underline-offset-2 transition"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default SignupOptions;
