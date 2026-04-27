import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { currencies } from "../constants/currencies";
import { useTranslation } from "react-i18next";

const OnlineEditJob = ({ form, setForm, handleChange }) => {
  const { t } = useTranslation();

  const [languageInput, setLanguageInput] = useState("");
  const [allLanguages, setAllLanguages] = useState([]);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);
  const languageContainerRef = useRef(null);

  const urgentPriceOptions = [
    { label: t("Fixed Price"), value: "fixed" },
    { label: t("Negotiable"), value: "negotiable" },
  ];

  const inputBase = "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        languageContainerRef.current &&
        !languageContainerRef.current.contains(e.target)
      ) {
        setLanguageSuggestions([]);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* ================= LOAD LANGUAGES ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/languages`)
      .then((res) => {
        const langs = res.data.map((l) => `${l.nativeName} (${l.name})`);
        setAllLanguages(langs);
      })
      .catch(() => setAllLanguages([]));
  }, []);

  /* ================= ADD LANGUAGE ================= */
  const addLanguage = (lang) => {
    if (!lang.trim()) return;

    if (!form.languages.includes(lang)) {
      setForm((prev) => ({
        ...prev,
        languages: [...prev.languages, lang],
      }));
    }

    setLanguageInput("");
    setLanguageSuggestions([]);
  };

  /* ================= REMOVE LANGUAGE ================= */
  const removeLanguage = (lang) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  return (
    <div className="space-y-6 text-white">
      {/* PROFESSION */}
      <input
        className={inputBase}
        placeholder={t("Profession")}
        value={form.profession}
        onChange={(e) => handleChange("profession", e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className={`${inputBase} h-28 resize-none`}
        placeholder={t("Work description")}
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* ================= PRICE ================= */}
      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          {urgentPriceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange("priceType", opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                form.priceType === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
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
                placeholder={t("Fixed price")}
                value={form.expectedPrice}
                onChange={(e) => handleChange("expectedPrice", e.target.value)}
                onWheel={(e) => e.target.blur()}
              />
            )}

            {form.priceType === "negotiable" && (
              <div className="flex gap-3 flex-wrap">
                <input
                  type="number"
                  className={inputBase}
                  placeholder={t("Min")}
                  value={form.minPrice}
                  onChange={(e) => handleChange("minPrice", e.target.value)}
                  onWheel={(e) => e.target.blur()}
                />
                <input
                  type="number"
                  className={inputBase}
                  placeholder={t("Max")}
                  value={form.maxPrice}
                  onChange={(e) => handleChange("maxPrice", e.target.value)}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= LANGUAGES ================= */}
      <div className="space-y-2 relative" ref={languageContainerRef}>
        {/* SELECTED LANGUAGES */}
        <div className="flex flex-wrap gap-2">
          {form.languages.map((lang, i) => (
            <span
              key={i}
              className="bg-indigo-600 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
            >
              {lang}
              <button
                className="text-white/70 hover:text-white"
                onClick={() => removeLanguage(lang)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* INPUT */}
        <input
          className={inputBase}
          placeholder={t("Add a language (English, Hindi...)")}
          value={languageInput}
          onFocus={() =>
            setLanguageSuggestions(
              allLanguages.filter((l) => !form.languages.includes(l))
            )
          }
          onChange={(e) => {
            const val = e.target.value;
            setLanguageInput(val);

            if (val.trim()) {
              setLanguageSuggestions(
                allLanguages.filter(
                  (l) => l.toLowerCase().includes(val.toLowerCase()) && !form.languages.includes(l)
                )
              );
            } else {
              setLanguageSuggestions(allLanguages.filter((l) => !form.languages.includes(l)));
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && languageInput.trim()) {
              e.preventDefault();
              addLanguage(languageInput.trim());
            }
          }}
        />

        {/* SUGGESTIONS */}
        {languageSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl bg-slate-800 border border-white/10 shadow-lg">
            {languageSuggestions.map((lang) => (
              <div
                key={lang}
                className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer rounded-lg"
                onClick={() => addLanguage(lang)}
              >
                {lang}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineEditJob;
