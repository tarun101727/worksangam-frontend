import React, { useState, Fragment, useCallback, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Listbox, Transition } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n.js";
import { useRef } from "react";
import { indianLanguages } from "../constants/languages";

export default function EmployeeAccountEdit({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    genderLabel: "",
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
  const [showProfessionsDropdown, setShowProfessionsDropdown] = useState(false);
    const { t } = useTranslation();
  const translateTimer = useRef(null);
const latestTypedValue = useRef({});
const transliterateTimer = useRef(null);
const latestTransliterateValue = useRef("");

const [languageSearch, setLanguageSearch] = useState("");
const [showDropdown, setShowDropdown] = useState(false);

const genders = [
  { id: "Male", name: t("Male") },
  { id: "Female", name: t("Female") },
  { id: "Other", name: t("Other") },
];

const transliterate = async (value, field) => {
  const currentLang = i18n.language || "en";

  latestTransliterateValue.current = value;

  const words = value.split(" ");
  const lastWord = words[words.length - 1];

  if (!lastWord) return;

  try {
    const res = await fetch(
      `https://inputtools.google.com/request?text=${lastWord}&itc=${currentLang}-t-i0-und&num=5`
    );

    const data = await res.json();

    if (data[0] === "SUCCESS") {
      const bestMatch = data[1][0][1][0];

      words[words.length - 1] = bestMatch;

      if (latestTransliterateValue.current !== value) return;

      setForm((prev) => ({
        ...prev,
        [field]: words.join(" "),
      }));
    }
  } catch (err) {
    console.error(err);
  }
};


const handleChange = (value, field) => {
  const currentLang = i18n.language || "en";

  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  if (!["te", "hi", "ta", "kn"].includes(currentLang)) return;

  clearTimeout(transliterateTimer.current);

  const words = value.split(" ");
  const lastWord = words[words.length - 1];

  if (value.endsWith(" ") && lastWord.length >= 2) {
    transliterate(value.trim(), field);
    return;
  }

  transliterateTimer.current = setTimeout(() => {
    if (lastWord.length >= 3) {
      transliterate(value, field);
    }
  }, 1000);
};

const translateText = async (text, field) => {
  const lang = i18n.language || "en";
  if (lang === "en") return;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await res.json();

    let translated = data[0].map((item) => item[0]).join("");

    const trailingSpaces = text.match(/\s+$/);
    if (trailingSpaces) {
      translated += trailingSpaces[0];
    }

    if (latestTypedValue.current[field] !== text) return;

    setForm((prev) => ({
      ...prev,
      [field]: translated,
    }));
  } catch (err) {
    console.error(err);
  }
};

const handleSentenceChange = (value, field) => {
  latestTypedValue.current[field] = value;

  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  const lang = i18n.language || "en";
  if (lang === "en") return;

  clearTimeout(translateTimer.current);

  translateTimer.current = setTimeout(() => {
    if (latestTypedValue.current[field] !== value) return;
    translateText(value, field);
  }, 800);
};

const filteredLanguages = indianLanguages.filter(
  (lang) =>
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !form.languages.includes(lang)
);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest("#languages-container")) {
      setShowDropdown(false);
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  useEffect(() => {
  if (!user) return;

  setForm((prev) => ({
    ...prev,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    age: user.age || "",
    gender: user.gender || "",
    genderLabel:
      user.genderLabel ||
      t(user.gender) || // 🔥 auto translate fallback
      "",
    profession: user.profession || "",
    professionType: user.professionType || "",
    skills: user.skills || "",
    experience: user.experience || "",
    languages: user.languages || [],
    bio: user.bio || "",
  }));

  setProfessionSearch(user.profession || "");

  if (user.profileImage) {
    setPreview(
      user.profileImage.startsWith("http")
        ? user.profileImage
        : `${BASE_URL}${user.profileImage}`
    );
  }

}, [user, i18n.language]); // 🔥 VERY IMPORTANT

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

  const handleProfessionChange = useCallback(
  (professionLabel) => {
    const selected = professions.find((p) => {
      return (
        p.name.toLowerCase() === professionLabel.toLowerCase() ||
        Object.values(p.translations || {}).some(
          (t) => t?.toLowerCase() === professionLabel.toLowerCase()
        )
      );
    });

    setForm((prev) => ({
      ...prev,
      profession: professionLabel, // ✅ store Hindi/Telugu/etc
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
       navigate(`/profile/${user._id}`);
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
          {t("Edit Your Employee Profile")}
        </h2>
        <p className="text-white/60 text-center text-sm mt-2 mb-6">
          {t("Update your professional details")}
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
              <span className="text-white/60 text-sm">{t("Add Photo")}</span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-center text-sm mb-4">⚠️ {error}</p>
        )}

        <div className="space-y-4">
          <input
            className={inputBase}
            placeholder={t("First name")}
            value={form.firstName}
            onChange={(e) => handleChange(e.target.value, "firstName")}
          />
          <input
            className={inputBase}
            placeholder={t("Last name")}
            value={form.lastName}
            onChange={(e) => handleChange(e.target.value, "lastName")}
          />
          <input
            className={inputBase}
            type="number"
            placeholder={t("Your age")}
            value={form.age}
            onChange={(e) => updateForm("age", e.target.value)}
          />

          {/* GENDER */}
          <Listbox
  value={form.gender}
  onChange={(v) => {
    const selected = genders.find(g => g.id === v);

    updateForm("gender", v); // ✅ English
    updateForm("genderLabel", selected.name); // ✅ Translated
  }}
>
            <div className="relative">
              <Listbox.Button className={inputBase}>
{
  form.genderLabel || t("Select your gender")
}
</Listbox.Button>
              <Transition as={Fragment}>
                <Listbox.Options className={listboxPanel}>
                  {genders.map((g) => (
                    <Listbox.Option
  key={g.id}
  value={g.id} 
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

          <div id="profession-container" className="relative mt-2">
  <input
    className={inputBase}
    placeholder={t("Search your profession (e.g. Electrician)")}
    value={professionSearch}
    onChange={(e) => {
      setProfessionSearch(e.target.value);
      updateForm("profession", e.target.value);
      setShowProfessionsDropdown(true); // show dropdown when typing
    }}
    onFocus={() => setShowProfessionsDropdown(true)} // show dropdown when focused
  />

  {/* Dropdown */}
  {showProfessionsDropdown && (
    <div className="mt-2 rounded-xl bg-[#0F172A] border border-white/10 max-h-60 overflow-y-auto">
      {filteredProfessions.length > 0 ? (
        filteredProfessions.map((p) => (
          <div
            key={p._id}
            onClick={() => {
  const selectedLabel =
    i18n.language !== "en" && p.translations?.[i18n.language]
      ? p.translations[i18n.language]
      : p.name;

  handleProfessionChange(selectedLabel); // ✅ store translated
  setProfessionSearch(selectedLabel);    // ✅ show translated
  setShowProfessionsDropdown(false);
}}
            className="px-4 py-2 text-white hover:bg-[#1F2937] cursor-pointer"
          >
            {i18n.language !== "en" && p.translations?.[i18n.language]
  ? p.translations[i18n.language]
  : p.name}
          </div>
        ))
      ) : (
        <div className="px-4 py-3 text-yellow-400">
          {t("Profession not found. Save new profession.")}
        </div>
      )}
    </div>
  )}

  {/* Save new profession button */}
  {professionSearch && filteredProfessions.length === 0 && (
    <button
      type="button"
      onClick={async () => {
        try {
          const res = await axios.post(`${BASE_URL}/api/professions/create`, {
            name: professionSearch,
          });

          handleProfessionChange(res.data.profession.name);
          setProfessionSearch(res.data.profession.name);
          setProfessions((prev) => [...prev, res.data.profession]);
          setShowProfessionsDropdown(false);
        } catch (err) {
          console.error("Failed to save profession", err);
        }
      }}
      className="mt-2 w-full py-2 rounded-xl bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A]"
    >
      {t("Save")} "{professionSearch}" {t("Profession")}
    </button>
  )}
</div>

       <div id="languages-container" className="relative mt-2">

  {/* Selected Languages Tags */}
  <div className="flex flex-wrap gap-2 mb-2">
    {form.languages.map((lang) => (
      <div
        key={lang}
        className="flex items-center bg-[#1F2937] text-white/90 px-3 py-1.5 rounded-full text-sm font-medium"
      >
        {lang}
        <button
          type="button"
          onClick={() =>
            updateForm(
              "languages",
              form.languages.filter((l) => l !== lang)
            )
          }
          className="ml-2 text-white/50 hover:text-red-400 font-bold"
        >
          ×
        </button>
      </div>
    ))}
  </div>

  {/* Input Field */}
  <input
    type="text"
    className={inputBase}
    placeholder={t("Search or type to add language...")}
    value={languageSearch}
    onChange={(e) => setLanguageSearch(e.target.value)}
    onFocus={() => setShowDropdown(true)}
  />

  {/* Dropdown */}
  {showDropdown && (
    <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl bg-[#0F172A] border border-white/10 shadow-xl">
      {filteredLanguages.length > 0 ? (
        filteredLanguages.map((lang) => (
          <div
            key={lang}
            className="px-4 py-2 cursor-pointer text-white hover:bg-[#374151]"
            onClick={() => {
              updateForm("languages", [...form.languages, lang]);
              setLanguageSearch("");
              setShowDropdown(false);
            }}
          >
            {lang}
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-yellow-400">
          {t("No languages found")}
        </div>
      )}
    </div>
  )}
</div>

          <input
            className={inputBase}
            placeholder={t("Skills")}
            value={form.skills}
            onChange={(e) => handleSentenceChange(e.target.value, "skills")}
          />
          <input
            className={inputBase}
            type="number"
            placeholder={t("Experience")}
            value={form.experience}
            onChange={(e) => updateForm("experience", e.target.value)}
          />
          <textarea
            className={`${inputBase} h-24`}
            placeholder={t("Short bio")}
            value={form.bio}
           onChange={(e) => handleSentenceChange(e.target.value, "bio")}
          />

          <button onClick={save} disabled={loading} className={buttonPrimary}>
            {loading ? t("Saving...") : t("Save Changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
