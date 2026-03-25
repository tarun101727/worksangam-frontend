import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate, useLocation } from "react-router-dom";

/* =======================
   EYE ICON
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

/* =======================
   SIGNUP EMAIL
======================= */
const SignupEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "hirer";

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =======================
     STYLES
  ======================= */
  const inputBase =
    "w-full px-4 py-2.5 md:py-3 rounded-xl bg-[#111827] text-white " +
    "placeholder-white/50 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const buttonPrimary =
    "w-full py-2.5 md:py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95 disabled:opacity-50";

  const sendOtp = async () => {
  if (!form.email || !form.password || !form.confirmPassword) {
    return setError("Please fill all fields");
  }

  if (!isValidEmail(form.email)) {
    return setError("Enter a valid email address");
  }

  if (form.password !== form.confirmPassword) {
    return setError("Passwords do not match");
  }

  try {
    setLoading(true);
    setError("");

    const response = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      email: form.email,
    });

    console.log("OTP Response:", response.data); // ✅ debug

    setStep(2);
    setMessage(response.data?.msg || "OTP sent successfully");
  } catch (err) {
    console.error("Send OTP Error:", err); // ✅ IMPORTANT

    setError(
      err?.response?.data?.msg || 
      err.message || 
      "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};

  /* =======================
     VERIFY OTP
  ======================= */
  const verifyOtp = async () => {
    if (!form.otp) return setError("Enter OTP");

    try {
      setLoading(true);
      setError("");
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email: form.email,
        password: form.password,
        otp: form.otp,
        role,
      });

      navigate(role === "hirer" ? "/signup/hirer" : "/signup/employee", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-start md:items-center justify-center px-4 pt-6 md:pt-0">
      <div
        className="w-full max-w-md md:max-w-lg
          p-4 sm:p-6 md:p-8
          rounded-none sm:rounded-3xl
          bg-transparent sm:bg-[#0F172A]/90
          backdrop-blur-0 sm:backdrop-blur-2xl
          border-0 sm:border sm:border-white/10
          shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
          transition-all duration-300"
      >
        {/* ROLE BADGE */}
        <div className="flex justify-center mb-4">
          <span className="px-4 py-1 text-xs font-semibold rounded-full bg-[#6366F1]/20 text-[#818CF8]">
            {role === "hirer" ? "FOR HIRERS" : "FOR WORKERS"}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-3">
          {role === "hirer"
            ? "Hire Skilled Workers Easily"
            : "Find Work & Get Hired Near You"}
        </h2>

        <p className="text-sm md:text-base text-white/60 text-center mb-8">
          {role === "hirer"
            ? "Create a hirer account to post jobs and hire trusted workers."
            : "Create a worker account to offer your skills and get hired nearby."}
        </p>

        {message && (
          <p className="text-green-400 text-center mb-3">{message}</p>
        )}
        {error && (
          <p className="text-red-400 text-center mb-3">{error}</p>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input
              className={inputBase}
              placeholder="Email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`${inputBase} pr-12`}
                placeholder="Password"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`${inputBase} pr-12`}
                placeholder="Confirm Password"
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>

            <button
              onClick={sendOtp}
              className={buttonPrimary}
              disabled={loading}
            >
              {loading
                ? "Sending OTP..."
                : role === "hirer"
                ? "Continue as Hirer"
                : "Continue as Worker"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              className={inputBase}
              placeholder="Enter OTP"
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />

            <button
              onClick={verifyOtp}
              className={buttonPrimary}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupEmail;
