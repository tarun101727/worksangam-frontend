import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";

const EmployeeDetailsForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { form } = location.state;

  const [employeeForm, setEmployeeForm] = useState({
    ...form,
    profession: "",
    skills: "",
    experience: "",
    bio: "",
    location: "",
    allowLocation: false,
    allowNotifications: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================
     STYLES (MATCHED THEME)
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
    "active:scale-95 disabled:opacity-50";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmployeeForm({
      ...employeeForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${BASE_URL}/api/auth/verify-otp-employee`,
        employeeForm
      );

      if (res.data.msg?.includes("success")) {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Something went wrong. Please try again." , err );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl
        bg-[#0F172A]/90 backdrop-blur-2xl
        border border-white/10
        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
        transition-all duration-500"
      >
        {/* HEADER */}
        <div className="flex justify-center mb-4">
          <span className="px-4 py-1 text-xs font-semibold rounded-full bg-[#6366F1]/20 text-[#818CF8]">
            WORKER PROFILE
          </span>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-white mb-3">
          Complete Your Profile
        </h2>

        <p className="text-sm text-white/60 text-center mb-8">
          Tell hirers about your skills and experience
        </p>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="profession"
            placeholder="Profession (e.g. Electrician)"
            value={employeeForm.profession}
            onChange={handleChange}
            className={inputBase}
          />

          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={employeeForm.skills}
            onChange={handleChange}
            className={inputBase}
          />

          <input
            type="number"
            name="experience"
            placeholder="Experience (years)"
            value={employeeForm.experience}
            onChange={handleChange}
            className={inputBase}
          />

          <textarea
            name="bio"
            placeholder="Short bio about your work"
            value={employeeForm.bio}
            onChange={handleChange}
            rows={4}
            className={`${inputBase} resize-none`}
          />

          <input
            type="text"
            name="location"
            placeholder="Your location"
            value={employeeForm.location}
            onChange={handleChange}
            className={inputBase}
          />

          {/* CHECKBOXES */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                name="allowLocation"
                checked={employeeForm.allowLocation}
                onChange={handleChange}
                className="accent-[#6366F1] scale-110"
              />
              Allow location access
            </label>

            <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                name="allowNotifications"
                checked={employeeForm.allowNotifications}
                onChange={handleChange}
                className="accent-[#6366F1] scale-110"
              />
              Allow notifications
            </label>
          </div>

          <button
            type="submit"
            className={buttonPrimary}
            disabled={loading}
          >
            {loading ? "Saving Profile..." : "Finish Signup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeDetailsForm;
