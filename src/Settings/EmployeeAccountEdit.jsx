/* =======================
   EmployeeAccountEdit.jsx
======================= */
import React, { useState, Fragment, useCallback, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Listbox, Transition } from "@headlessui/react";
import { indianLanguages } from "../constants/languages";
import { useNavigate, useLocation } from "react-router-dom";

const genders = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
  { id: "Other", name: "Other" },
];

export default function EmployeeAccountEdit({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    profession: "",
    professionType: "",
    skills: "",
    experience: "",
    languages: [],
    bio: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------
  // Profession search & list
  // -------------------------
  const [professions, setProfessions] = useState([]);
  const [professionSearch, setProfessionSearch] = useState("");
  const [filteredProfessions, setFilteredProfessions] = useState([]);

  // -------------------------
  // Load user data
  // -------------------------
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!user || loaded) return;

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      age: user.age || "",
      gender: user.gender || "",
      profession: user.profession || "",
      professionType: user.professionType || "",
      skills: user.skills || "",
      experience: user.experience || "",
      languages: user.languages || [],
      bio: user.bio || "",
    });
    
    setProfessionSearch(user.profession || "");

    if (user.profileImage) {
      setPreview(`${BASE_URL}${user.profileImage}`);
    }

    setLoaded(true);
  }, [user, loaded]);

  // -------------------------
  // Receive image from preview page
  // -------------------------
  useEffect(() => {
    if (location.state?.profileImage && location.state?.file) {
      setPreview(location.state.profileImage);
      setImage(location.state.file);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, navigate, location.pathname]);

  // -------------------------
  // Fetch professions from backend
  // -------------------------
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/professions`);
        setProfessions(res.data.professions || []);
      } catch (err) {
        console.error("Failed to load professions", err);
      }
    };
    fetchProfessions();
  }, []);

  // -------------------------
  // Filter professions
  // -------------------------
  useEffect(() => {
    if (!professionSearch) {
      setFilteredProfessions([]);
      return;
    }

    const filtered = professions.filter((p) =>
      p.name.toLowerCase().includes(professionSearch.toLowerCase())
    );
    setFilteredProfessions(filtered);
  }, [professionSearch, professions]);

  // -------------------------
  // Helpers
  // -------------------------
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleLanguage = useCallback((lang) => {
    setForm((prev) => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists
          ? prev.languages.filter((l) => l !== lang)
          : [...prev.languages, lang],
      };
    });
  }, []);

  const handleProfessionChange = useCallback(
    (professionName) => {
      const selected = professions.find(
        (p) => p.name.toLowerCase() === professionName.toLowerCase()
      );

      setForm((prev) => ({
        ...prev,
        profession: professionName,
        professionType: selected ? selected.type : "offline",
      }));
    },
    [professions]
  );

  // -------------------------
  // Save profile
  // -------------------------
  const save = async () => {
    setLoading(true);
    setError("");

    try {
      // Save new profession if not in list
      if (professionSearch && filteredProfessions.length === 0) {
        try {
          const res = await axios.post(`${BASE_URL}/api/professions/create`, {
            name: professionSearch,
          });
          handleProfessionChange(res.data.profession.name);
          setProfessions((prev) => [...prev, res.data.profession]);
        } catch (err) {
          console.error("Failed to save profession", err);
        }
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "languages") {
          formData.append("languages", value.join(","));
        } else {
          formData.append(key, value);
        }
      });

      if (image) formData.append("profileImage", image);

      await axios.post(`${BASE_URL}/api/auth/create-employee-account`, formData, {
        withCredentials: true,
      });

      alert("Profile updated");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Styles
  // -------------------------
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const listboxPanel =
    "absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-[#0F172A] border border-white/10 shadow-xl";

  const listboxOption = (active) =>
    `px-4 py-2 cursor-pointer text-white ${active ? "bg-[#1F2937]" : ""}`;

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 transition-all duration-300 hover:bg-[#4F46E5] active:scale-95 disabled:opacity-50";

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="min-h-screen overflow-y-auto flex justify-center items-start sm:items-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-lg p-4 sm:p-8 rounded-none sm:rounded-3xl bg-transparent sm:bg-[#0F172A]/90 border-0 sm:border sm:border-white/10">
        <h2 className="text-3xl font-bold text-white text-center">
          Edit Your Employee Profile
        </h2>
        <p className="text-white/60 text-center text-sm mt-2 mb-6">
          Update your professional details
        </p>

        {/* PROFILE IMAGE */}
        <div
          onClick={() => navigate("/profile-image/employee-edit")}
          className="w-24 h-24 mx-auto rounded-full p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 cursor-pointer mb-6"
        >
          <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white/60 text-sm">Add Photo</span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-center text-sm mb-4">⚠️ {error}</p>
        )}

        <div className="space-y-4">
          <input
            className={inputBase}
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => updateForm("firstName", e.target.value)}
          />
          <input
            className={inputBase}
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => updateForm("lastName", e.target.value)}
          />
          <input
            className={inputBase}
            type="number"
            placeholder="Your age"
            value={form.age}
            onChange={(e) => updateForm("age", e.target.value)}
          />

          {/* GENDER */}
          <Listbox value={form.gender} onChange={(v) => updateForm("gender", v)}>
            <div className="relative">
              <Listbox.Button className={inputBase}>
                {form.gender || "Select gender"}
              </Listbox.Button>
              <Transition as={Fragment}>
                <Listbox.Options className={listboxPanel}>
                  {genders.map((g) => (
                    <Listbox.Option
                      key={g.id}
                      value={g.name}
                      className={({ active }) => listboxOption(active)}
                    >
                      {g.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* PROFESSION SEARCH */}
          <label className="block text-sm text-white/70">What do you do?</label>
          <input
            className={inputBase}
            placeholder="Search your profession"
            value={professionSearch}
            onChange={(e) => {
              setProfessionSearch(e.target.value);
              updateForm("profession", e.target.value);
            }}
          />

          {/* PROFESSION RESULTS */}
          {professionSearch && (
            <div className="mt-2 rounded-xl bg-[#0F172A] border border-white/10 max-h-60 overflow-y-auto">
              {filteredProfessions.length > 0 ? (
                filteredProfessions.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      handleProfessionChange(p.name);
                      setProfessionSearch(p.name);
                    }}
                    className="px-4 py-2 text-white hover:bg-[#1F2937] cursor-pointer"
                  >
                    {p.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-yellow-400">
                  Profession not found. Save new profession.
                </div>
              )}
            </div>
          )}

          {/* SAVE NEW PROFESSION BUTTON */}
          {professionSearch && filteredProfessions.length === 0 && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await axios.post(`${BASE_URL}/api/professions/create`, {
                    name: professionSearch,
                  });
                  handleProfessionChange(res.data.profession.name);
                  setProfessions((prev) => [...prev, res.data.profession]);
                  setProfessionSearch(res.data.profession.name);
                } catch (err) {
                  console.error("Failed to save profession", err);
                }
              }}
              className="mt-2 w-full py-2 rounded-xl bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A]"
            >
              Save "{professionSearch}" Profession
            </button>
          )}

          {/* LANGUAGES */}
          <div>
            <label className="block text-sm text-white/70 mb-1">
              Languages you can communicate in
            </label>
            <div className="flex flex-wrap gap-2">
              {indianLanguages.map((lang) => {
                const selected = form.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selected
                        ? "bg-[#6366F1] text-white"
                        : "bg-[#1F2937] text-white/80 hover:bg-[#374151]"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <input
            className={inputBase}
            placeholder="Skills"
            value={form.skills}
            onChange={(e) => updateForm("skills", e.target.value)}
          />
          <input
            className={inputBase}
            type="number"
            placeholder="Experience"
            value={form.experience}
            onChange={(e) => updateForm("experience", e.target.value)}
          />
          <textarea
            className={`${inputBase} h-24`}
            placeholder="Short bio"
            value={form.bio}
            onChange={(e) => updateForm("bio", e.target.value)}
          />

          <button onClick={save} disabled={loading} className={buttonPrimary}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}