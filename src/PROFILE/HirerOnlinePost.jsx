import { useTranslation } from "react-i18next";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "../config";
import { currencies } from "../constants/currencies";
import i18n from "../i18n";
import { useRef } from "react";


/* ================= EMPTY FORM ================= */

const emptyForm = () => ({
  profession: "",
  description: "",
  priceType: null,
  expectedPrice: "",
  minPrice: "",
  maxPrice: "",
  currency: "INR",
  postType: "urgent",
  addressDetails: "",
  location: {
    type: "Point",
    coordinates: [],
    address: "",
  },
});

const HirerOnlinePost = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [onlineProfessions, setOnlineProfessions] = useState([]);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  /* ================= LANGUAGE INPUT ================= */
const [languageInput, setLanguageInput] = useState("");
const [languages, setLanguages] = useState([]);
const [languageSuggestions, setLanguageSuggestions] = useState([]);
    const { t } = useTranslation();
const translateTimer = useRef(null);
const latestTypedValue = useRef({});

const urgentPriceOptions = [
  { label: t("Fixed Price"), value: "fixed" },
  { label: t("Negotiable"), value: "negotiable" },
];

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700/60 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

  const selectedCurrency = currencies.find(
    (c) => c.code === form.currency
  );

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".profession-dropdown")) {
      setShowSuggestions(false);
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (key, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= FETCH PROFESSIONS ================= */

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const lang = i18n.language || "en";

const res = await axios.get(
  `${BASE_URL}/api/online-professions?lang=${lang}`
);
        setOnlineProfessions(res.data.professions || []);
      } catch (err) {
        console.error("Failed to fetch professions", err);
        setOnlineProfessions([]);
      }
    };

    fetchProfessions();
  }, []);

  /* ================= FILTER ================= */

const filteredProfessions = search
  ? onlineProfessions.filter((p) =>
      p?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p?.originalName?.toLowerCase().includes(search.toLowerCase())
    )
  : onlineProfessions;

  /* ================= SUBMIT ================= */

const submit = async () => {
  // Validation
  if (!form.profession.trim()) {
    setError("Profession is required");
    return;
  }
  if (!form.description.trim()) {
    setError("Description is required");
    return;
  }
  if (languages.length === 0 && !languageInput.trim()) {
    setError("At least one language is required");
    return;
  }

  try {
    setLoading(true);
    setError("");

    // Auto-add typed language if not empty
    const allLanguages = languageInput.trim()
      ? [...languages, languageInput.trim()]
      : [...languages];

    const res = await axios.post(
      `${BASE_URL}/api/jobs/create-online-post`,
      { ...form, languages: allLanguages },
      { withCredentials: true }
    );

    navigate(`/job/${res.data.job._id}`);
  } catch {
    setError("Failed to create job post");
  } finally {
    setLoading(false);
    setLanguageInput(""); // clear input
  }
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

    // preserve trailing spaces
    const trailingSpaces = text.match(/\s+$/);
    if (trailingSpaces) {
      translated += trailingSpaces[0];
    }

    // prevent overwrite race condition
    if (latestTypedValue.current[field] !== text) return;

    handleChange(field, translated);
  } catch (err) {
    console.error(err);
  }
};

const handleSentenceChange = (value, field) => {
  latestTypedValue.current[field] = value;

  // instant UI update
  handleChange(field, value);

  const lang = i18n.language || "en";
  if (lang === "en") return;

  clearTimeout(translateTimer.current);

  translateTimer.current = setTimeout(() => {
    if (latestTypedValue.current[field] !== value) return;

    translateText(value, field);
  }, 800); // delay for smooth typing
};

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-xl space-y-6">

        <h2 className="text-xl font-semibold text-white">
          {t("Create Online Worker Post")}
        </h2>

        {error && (
          <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* ================= PROFESSION SEARCH ================= */}

        <div className="relative profession-dropdown">

          <input
            type="text"
            className={inputBase}
            placeholder={t("Search worker (Web Developer, Graphic Designer...)")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

          {showSuggestions && (
            <div className="absolute z-20 w-full mt-2 max-h-60 overflow-auto rounded-xl bg-slate-900 border border-slate-700 shadow-lg">

              {filteredProfessions.length > 0 ? (
                filteredProfessions.map((profession) => (

                  <div
                    key={profession._id || profession.id}
                    className="px-4 py-2 text-sm text-slate-200 hover:bg-indigo-500/20 cursor-pointer"
                    onClick={() => {
                      handleChange("profession", profession.name);
                      setSearch(profession.name);
                      setShowSuggestions(false);
                    }}
                  >
                    {profession.name}
                  </div>

                ))
              ) : (
                <p className="px-4 py-2 text-sm text-slate-500">
                  {t("No profession found")}
                </p>
              )}

            </div>
          )}

        </div>

        {/* ================= DESCRIPTION ================= */}

        <div className="space-y-2">

          <p className="text-sm font-medium text-red-400">
            💻 {t("Work Description")}
          </p>

          <textarea
            className={`${inputBase} h-28 resize-none`}
            placeholder={t("Example: Need a React developer to fix login authentication bug...")}
            value={form.description}
            maxLength={250}
            onChange={(e) =>
  handleSentenceChange(e.target.value, "description")
}
          />

        </div>

        {/* ================= PRICE ================= */}

        <div className="space-y-3">

          <p className="text-sm text-slate-400">{t("Price")}</p>

          <div className="flex gap-3 flex-wrap">
            {urgentPriceOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange("priceType", opt.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  form.priceType === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {form.priceType && (
            <>
              <select
                className={inputBase}
                value={form.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.display}
                  </option>
                ))}
              </select>

              {form.priceType === "fixed" && (
                <input
                  type="number"
                  className={inputBase}
                 placeholder={`${t("Fixed price")} (${selectedCurrency?.symbol})`}
                  value={form.expectedPrice}
                  onChange={(e) =>
                    handleChange("expectedPrice", e.target.value)
                  }
                />
              )}

              {form.priceType === "negotiable" && (
                <div className="flex gap-3">
                  <input
                    type="number"
                    className={inputBase}
                    placeholder={t("Min price")}
                    value={form.minPrice}
                    onChange={(e) =>
                      handleChange("minPrice", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    className={inputBase}
                    placeholder={t("Max price")}
                    value={form.maxPrice}
                    onChange={(e) =>
                      handleChange("maxPrice", e.target.value)
                    }
                  />
                </div>
              )}
            </>
          )}


        </div>
        
        
<div className="space-y-2 relative">
  <p className="text-sm font-medium text-red-400">🗣 {t("Languages Required")}</p>

  {/* Selected languages */}
  <div className="flex flex-wrap gap-2 mb-2">
    {languages.map((lang, idx) => (
      <span
        key={idx}
        className="bg-indigo-600 text-white px-3 py-1 rounded-full flex items-center gap-2"
      >
        {lang}
        <button
          type="button"
          onClick={() =>
            setLanguages(langs => langs.filter(l => l !== lang))
          }
          className="text-white/70 hover:text-white"
        >
          ✕
        </button>
      </span>
    ))}
  </div>

  {/* Input */}
  <input
    type="text"
    className={inputBase}
    placeholder={t("Add a language (English, Hindi...)")}
    value={languageInput}
    onChange={async (e) => {
      const val = e.target.value;
      setLanguageInput(val);

      if (val.trim()) {
        try {
          const res = await axios.get(
            `${BASE_URL}/api/languages?search=${val.trim()}`,
            { withCredentials: true }
          );
          setLanguageSuggestions(res.data || []);
        } catch (err) {
          console.error(err);
          setLanguageSuggestions([]);
        }
      } else {
        setLanguageSuggestions([]);
      }
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (languageInput.trim() && !languages.includes(languageInput.trim())) {
          setLanguages(prev => [...prev, languageInput.trim()]);
          setLanguageInput("");
          setLanguageSuggestions([]);
        }
      }
    }}
  />

  {/* Suggestions dropdown */}
  {languageSuggestions.length > 0 && (
    <div className="absolute z-20 w-full mt-2 max-h-60 overflow-auto rounded-xl bg-slate-900 border border-slate-700 shadow-lg">
      {languageSuggestions.map((lang) => (
        <div
          key={lang._id}
          className="px-4 py-2 text-sm text-slate-200 hover:bg-indigo-500/20 cursor-pointer"
          onClick={() => {
            if (!languages.includes(lang.name)) {
              setLanguages(prev => [...prev, lang.name]);
            }
            setLanguageInput("");
            setLanguageSuggestions([]);
          }}
        >
          {lang.name} ({lang.code})
        </div>
      ))}
    </div>
  )}
</div>

        {/* ================= SUBMIT ================= */}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-500"
        >
          {loading ? t("Please wait...") : t("Submit Job Post")}
        </button>

      </div>
      

    </div>
  );
};

export default HirerOnlinePost;
