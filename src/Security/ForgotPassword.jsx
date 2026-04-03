import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
/* =======================
   EYE ICON (MATCHED THEME)
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

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useTranslation();
  /* =======================
     STYLES (GLOBAL AUTH THEME)
  ======================= */
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white " +
    "placeholder-white/50 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] " +
    "shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  /* =======================
     API HANDLERS
  ======================= */
  const sendOtp = async () => {
    if (!form.email) return setError("Email is required");

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.post(
        `${BASE_URL}/api/auth/send-otp-forgot-password`,
        { email: form.email }
      );

      setOtpSent(true);
      setMessage("OTP sent to your email");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp) return setError("OTP is required");

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.post(
        `${BASE_URL}/api/auth/verify-otp-forgot-password`,
        {
          email: form.email,
          otp: form.otp,
        }
      );

      setOtpVerified(true);
      setMessage("OTP verified successfully");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (form.newPassword !== form.confirmNewPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });

      setMessage("Password reset successfully");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex px-4
                 items-start justify-start
                 sm:items-center sm:justify-center"
    >
      <div
        className="mx-auto w-full max-w-md p-6 sm:p-8
                   rounded-none sm:rounded-3xl
                   bg-transparent sm:bg-[#0F172A]/90
                   backdrop-blur-0 sm:backdrop-blur-2xl
                   border-0 sm:border sm:border-white/10
                   shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
                   transition-all duration-500"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
         {t("Forgot Password")}
        </h2>

        {message && (
          <p className="text-green-400 text-center mb-4">{t("message")}</p>
        )}
        {error && (
          <p className="text-red-400 text-center mb-4">{t("error")}</p>
        )}

        <input
          type="email"
          placeholder={t("Email")}
          className={inputBase}
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {!otpSent && (
          <button
            onClick={sendOtp}
            disabled={loading}
            className={`${buttonPrimary} mt-5`}
          >
            {loading ? t("Sending OTP...") : t("Send OTP")}
          </button>
        )}

        {otpSent && (
          <>
            <input
              placeholder={t("Enter OTP")}
              className={`${inputBase} mt-4`}
              value={form.otp}
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />

            {!otpVerified && (
              <button
                onClick={verifyOtp}
                disabled={loading}
                className={`${buttonPrimary} mt-4`}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>
            )}
          </>
        )}

        {otpVerified && (
          <>
            <div className="relative mt-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("New Password")}
                className={`${inputBase} pr-12`}
                value={form.newPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    newPassword: e.target.value,
                  })
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

            <div className="relative mt-3">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("Confirm Password")}
                className={`${inputBase} pr-12`}
                value={form.confirmNewPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmNewPassword: e.target.value,
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
              onClick={resetPassword}
              disabled={loading}
              className={`${buttonPrimary} mt-5`}
            >
              {loading ? t("Saving Password...") : t("Save Password")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
