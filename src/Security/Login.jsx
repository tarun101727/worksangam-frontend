import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAuth } from "../useAuth";

/* =======================
   Eye Icon
======================= */
const EyeIcon = ({ open }) =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white/70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5
           c4.477 0 8.268 2.943 9.542 7
           -1.274 4.057-5.065 7-9.542 7
           -4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white/70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5
           c4.477 0 8.268 2.943 9.542 7
           -1.274 4.057-5.065 7-9.542 7
           -4.477 0-8.268-2.943-9.542-7z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );

const Login = () => {
  const { setIsAuthenticated, setUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* =======================
     STYLES
  ======================= */
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white " +
    "placeholder-white/50 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const handleInputChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email: form.email.toLowerCase(),
          password: form.password,
        },
        { withCredentials: true }
      );

      const user = res.data.user;

      // Update auth state (optional but good)
      setIsAuthenticated(true);
      setUser(user);

      /* =======================
         FULL PAGE REFRESH LOGIC
      ======================= */

      if (user.onboardingStep === "employee_profile") {
        window.location.href = "/signup/employee";
        return;
      }

      if (user.onboardingStep === "hirer_profile") {
        window.location.href = "/signup/hirer";
        return;
      }

      // Default redirect
      window.location.href = "/home";

    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen px-4
        flex flex-col justify-start
        sm:flex sm:items-center sm:justify-center
      "
    >
      {/* Card */}
      <div
        className="
          w-full max-w-md mx-auto
          rounded-3xl
          p-4 sm:p-8
          transition-all duration-500

          /* MOBILE */
          bg-transparent shadow-none border-none backdrop-blur-0 mt-4

          /* DESKTOP */
          sm:bg-[#0F172A]/90
          sm:backdrop-blur-2xl
          sm:border sm:border-white/10
          sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
        "
      >
        <h2 className="text-3xl font-extrabold text-center text-white mb-6">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleInputChange}
          placeholder="Email"
          className={inputBase}
        />

        <div className="relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            className={`${inputBase} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`${buttonPrimary} mt-6`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-4 text-white/60">
          <span className="mr-1">Having trouble?</span>
          <a
            href="/forgot-password"
            className="text-[#818CF8] hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
