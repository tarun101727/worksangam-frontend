
import { useTranslation } from "react-i18next";
import React, { useState, useRef, Fragment, useCallback, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth";
import { Listbox, Transition } from "@headlessui/react";
import i18n from "../i18n.js";

const EmployeeSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser } = useAuth();

  const profileImage = location.state?.profileImage || null;
  const profileFile = location.state?.file || null;

  /* =======================
     STATE
  ======================= */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [professions, setProfessions] = useState([]);
  const [professionSearch, setProfessionSearch] = useState("");
  const [filteredProfessions, setFilteredProfessions] = useState([]);
  // For Languages multi-select input
const [languageSearch, setLanguageSearch] = useState(""); // input text
const [showDropdown, setShowDropdown] = useState(false); // whether dropdown is visible
// Add this
const [showProfessionsDropdown, setShowProfessionsDropdown] = useState(false);
  const { t } = useTranslation();

  const translateTimer = useRef(null);
  const latestTypedValue = useRef({});
  const transliterateTimer = useRef(null);
  const latestTransliterateValue = useRef("");
const [languagesList, setLanguagesList] = useState([]);

useEffect(() => {
  const fetchLanguages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/languages`);
      // Map to "nativeName (English Name)" format
      setLanguagesList(
        res.data.map(lang => `${lang.nativeName} (${lang.name})`)
      );
    } catch (err) {
      console.error("Failed to fetch languages", err);
    }
  };

  fetchLanguages();
}, []);


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
      const suggestions = data[1][0][1];
      const bestMatch = suggestions[0];

      words[words.length - 1] = bestMatch;

      // prevent overwrite
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

 if (!["te","hi","ta","kn","as","bn","gu","mr","pa","ml","or","si","ur"].includes(currentLang)) return;

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

    // ✅ preserve trailing spaces
    const trailingSpaces = text.match(/\s+$/);
    if (trailingSpaces) {
      translated += trailingSpaces[0];
    }

    // prevent overwrite
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
  // store latest typed value
  latestTypedValue.current[field] = value;

  // update UI immediately
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  const lang = i18n.language || "en";
  if (lang === "en") return;

  clearTimeout(translateTimer.current);

  translateTimer.current = setTimeout(() => {
    // if user typed something new, skip
    if (latestTypedValue.current[field] !== value) return;

    translateText(value, field);
  }, 800);
};


/* =======================
   OPTIONS
======================= */
const genders = [
  { id: "Male", name: t("Male") },
  { id: "Female", name: t("Female") },
  { id: "Other", name: t("Other") },
];

const filteredLanguages = languagesList.filter(
  (lang) =>
    lang.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !form.languages.includes(lang)
);

  useEffect(() => {
  const search = professionSearch.toLowerCase();

  const filtered = professions.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(search);

    const translationMatch =
      p.translations &&
      Object.values(p.translations).some((t) =>
        t?.toLowerCase().includes(search)
      );

    return nameMatch || translationMatch;
  });

  setFilteredProfessions(filtered);
}, [professionSearch, professions]);

  useEffect(() => {

  const fetchProfessions = async () => {

    try {

      const res = await axios.get(
        `${BASE_URL}/api/professions`
      );

      setProfessions(res.data.professions);

    } catch (err) {
      console.error("Failed to load professions" , err );
    }

  };

  fetchProfessions();

}, []);

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
  const handleClickOutside = (e) => {
    if (!e.target.closest("#profession-container")) {
      setShowProfessionsDropdown(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  /* =======================
     HELPERS
  ======================= */
  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleProfessionChange = useCallback((professionName) => {
  const selected = professions.find(
    (p) => p.name.toLowerCase() === professionName.toLowerCase()
  );

  setForm((prev) => ({
    ...prev,
    profession: professionName,
    professionType: selected ? selected.type : "offline", // fallback to offline
  }));
}, [professions]);

  /* =======================
     STYLES
  ======================= */
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-[#111827] text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

  const listboxPanel =
    "absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-xl bg-[#0F172A] border border-white/10 shadow-xl";

  const listboxOption = (active) =>
    `px-4 py-2 cursor-pointer text-white ${
      active ? "bg-[#1F2937]" : ""
    }`;

  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 transition-all duration-300 hover:bg-[#4F46E5] hover:shadow-xl active:scale-95 disabled:opacity-50";

  const isFormComplete =
    form.firstName &&
    form.lastName &&
    form.age &&
    form.gender &&
    form.profession &&
    form.skills &&
    form.experience &&
    form.languages.length > 0;

  /* =======================
     VALIDATION
  ======================= */
  const validateForm = () => {
      if (!form.firstName.trim()) {
  return "First name is required";
}

if (!form.lastName.trim()) {
  return "Last name is required";
}

    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 18 || age > 100)
      return "Age must be between 18 and 100";

    if (!form.gender) return "Please select your gender";
    if (!form.profession) return "Please select your profession";

    const exp = Number(form.experience);
    if (!Number.isInteger(exp) || exp < 0 || exp > 60)
      return "Please enter valid years of experience";

    if (form.languages.length === 0)
      return "Please select at least one language";

    return null;
  };

  /* =======================
     SUBMIT
  ======================= */
const createEmployeeAccount = async () => {
  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setLoading(true);
    setError("");

    // -----------------------------
    // Step 1: Check and create profession
    // -----------------------------
    let professionName = form.profession; // assuming form.profession holds the selected/typed profession
    if (professionName) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/professions/create`,
          { name: professionName, type: "offline" } // default offline
        );

        // Update form & UI
        professionName = res.data.profession.name;
        handleProfessionChange(professionName);
        setProfessionSearch(professionName);
        setProfessions((prev) => [...prev, res.data.profession]);
      } catch (err) {
        console.error("Failed to save profession", err);
        // Optional: you can choose to continue or abort
      }
    }

    // -----------------------------
    // Step 2: Create Employee Account
    // -----------------------------
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "languages") {
        formData.append("languages", value.join(","));
      } else if (key === "profession") {
        formData.append("profession", professionName); // use updated profession name
      } else {
        formData.append(key, value);
      }
    });

    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    const res = await axios.post(
      `${BASE_URL}/api/auth/create-employee-account`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    setIsAuthenticated(true);
    setUser(res.data.user);
    navigate("/home", { replace: true });
  } catch (err) {
    setError(err.response?.data?.msg || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  /* =======================
     JSX
  ======================= */
  return (
    <div className="min-h-screen flex justify-center items-start sm:items-center px-4 py-6 sm:py-12">
      <div className="
  w-full max-w-lg
  p-4 sm:p-8
  rounded-none sm:rounded-3xl
  bg-transparent sm:bg-[#0F172A]/90
  backdrop-blur-0 sm:backdrop-blur-2xl
  border-0 sm:border sm:border-white/10
  shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
">

        
        <h2 className="text-3xl font-bold text-white text-center">
          {t("Create Your Employee Profile")}
        </h2>
        <p className="text-white/60 text-center text-sm mt-2 mb-6">
          {t("Help employers know who you are and what you do")}
        </p>

        {/* PROFILE IMAGE */}
<div
  onClick={() => navigate("/profile-image/employee")}
  className="
    w-24 h-24 mx-auto rounded-full
    p-[3px]
    bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500
    cursor-pointer mb-2
  "
>
  <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
    {profileImage ? (
      <img
        src={profileImage}
        alt="Profile"
        className="w-full h-full object-cover rounded-full"
      />
    ) : (
      <span className="text-white/60 text-sm">{t("Add Photo")}</span>
    )}
  </div>
</div>




        <p className="text-center text-xs text-white/40 mb-6">
          {t("Recommended: clear face photo")}
        </p>

        {error && (
          <p className="text-red-400 text-center text-sm mb-4">
            ⚠️ {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            className={inputBase}
            placeholder={t("First name (e.g. Rahul)")}
            value={form.firstName}
            onChange={(e) => handleChange(e.target.value, "firstName")}
          />

          <input
            className={inputBase}
            placeholder={t("Last name (e.g. Sharma)")}
            value={form.lastName}
            onChange={(e) => handleChange(e.target.value, "lastName")}
          />

          <input
            className={inputBase}
            type="number"
            placeholder={t("Your age")}
            value={form.age}
            onChange={(e) => updateForm("age", e.target.value)}
             onWheel={(e) => e.target.blur()}
          />

          {/* GENDER */}
          <Listbox
  value={form.gender}
  onChange={(v) => {
    const selected = genders.find(g => g.id === v);

    updateForm("gender", v); // ✅ English (for backend logic)
    updateForm("genderLabel", selected.name); // ✅ Translated (for DB)
  }}
>
            <div className="relative">
              <Listbox.Button className={inputBase}>
  {
    genders.find(g => g.id === form.gender)?.name 
    || t("Select your gender")
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
      handleProfessionChange(p.name); // keep English internally
      setProfessionSearch(
        i18n.language !== "en" && p.translations?.[i18n.language]
          ? p.translations[i18n.language]
          : p.name
      );
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
            placeholder={t("Your skills (e.g. Excel, React, Accounting)")}
            value={form.skills}
            onChange={(e) => handleSentenceChange(e.target.value, "skills")}
          />

          <input
            className={inputBase}
            type="number"
            placeholder={t("Total work experience (in years)")}
            value={form.experience}
            onChange={(e) => handleChange(e.target.value, "experience")}
            onWheel={(e) => e.target.blur()}
          />

          <textarea
            className={`${inputBase} h-24`}
            placeholder={t("Write a short introduction about yourself (2–3 lines)")}
            value={form.bio}
            onChange={(e) => handleSentenceChange(e.target.value, "bio")}
          />

          <button
            onClick={createEmployeeAccount}
            disabled={!isFormComplete || loading}
            className={buttonPrimary}
          >
            {loading ? t("Setting up your profile...") : t("Complete Profile")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSignup;
