import React, { useState, Fragment } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth.js";
import { Listbox, Transition } from "@headlessui/react";

/* =======================
   CONSTANTS & VALIDATION
======================= */
const GENDERS = ["Male", "Female", "Other"];
const NAME_REGEX = /^[A-Za-z]{2,30}$/;
const MIN_AGE = 18;
const MAX_AGE = 100;

const HirerSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
  });

  const profileImage = location.state?.profileImage || null;
const profileFile = location.state?.file || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================
     VALIDATION
  ======================= */
  const validateForm = () => {
    if (!NAME_REGEX.test(form.firstName)) {
      return "First name must be 2–30 letters only";
    }

    if (!NAME_REGEX.test(form.lastName)) {
      return "Last name must be 2–30 letters only";
    }

    const ageNum = Number(form.age);
    if (!Number.isInteger(ageNum) || ageNum < MIN_AGE || ageNum > MAX_AGE) {
      return "Age must be between 18 and 100";
    }

    if (!GENDERS.includes(form.gender)) {
      return "Please select a valid gender";
    }

    if (!profileFile) {
      return "Profile image is required";
    }

    return null;
  };

  /* =======================
     CREATE ACCOUNT
  ======================= */
  const createAccount = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("firstName", form.firstName.trim());
      formData.append("lastName", form.lastName.trim());
      formData.append("age", Number(form.age));
      formData.append("gender", form.gender);
      formData.append("profileImage", profileFile);

      const res = await axios.post(
        `${BASE_URL}/api/auth/create-account`,
        formData,
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setUser(res.data.user);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Account creation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white " +
    "border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white bg-[#6366F1] disabled:opacity-50";

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center px-4 pt-6 md:pt-0">
      <div
        className="
          w-full max-w-md
          p-6 md:p-8
          bg-transparent md:bg-[#0F172A]/90
          border-none md:border md:border-white/10
          rounded-none md:rounded-3xl
        "
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Complete Your Profile
        </h2>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {/* PROFILE IMAGE */}
        <div
          onClick={() => navigate("/profile-image/hirer")}
          className="
            w-24 h-24 mx-auto rounded-full
            p-[3px]
            bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500
            cursor-pointer mb-6
          "
        >
          <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
            {profileImage ? (
              <img
              src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white/60 text-sm">Add Photo</span>
            )}
          </div>
        </div>

        {/* FIRST NAME */}
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) =>
            setForm({
              ...form,
              firstName: e.target.value.replace(/[^A-Za-z]/g, ""),
            })
          }
          className={inputBase}
        />

        {/* LAST NAME */}
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) =>
            setForm({
              ...form,
              lastName: e.target.value.replace(/[^A-Za-z]/g, ""),
            })
          }
          className={`${inputBase} mt-4`}
        />

        {/* AGE */}
        <input
          type="number"
          min="18"
          max="100"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          className={`${inputBase} mt-4`}
          onWheel={(e) => e.target.blur()}
        />

        {/* GENDER — DESKTOP GAP WHEN OPEN */}
        <Listbox
          value={form.gender}
          onChange={(v) => setForm({ ...form, gender: v })}
        >
          {({ open }) => (
            <div
              className={`
                relative w-full
                ${open ? "md:mb-36" : "md:mb-0"}
              `}
            >
              <Listbox.Button className={`${inputBase} mt-4 text-left`}>
                {form.gender || "Select Gender"}
              </Listbox.Button>

              <Transition as={Fragment}>
                <Listbox.Options
                  className="
                    w-full
                    mt-2 bg-[#111827]
                    rounded-xl border border-white/10
                    static md:absolute z-10
                  "
                >
                  {GENDERS.map((g) => (
                    <Listbox.Option
                      key={g}
                      value={g}
                      className="px-4 py-2 cursor-pointer hover:bg-[#6366F1]/20"
                    >
                      {g}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>

        <button
          onClick={createAccount}
          disabled={loading}
          className={`${buttonPrimary} mt-6`}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
};

export default HirerSignup;
