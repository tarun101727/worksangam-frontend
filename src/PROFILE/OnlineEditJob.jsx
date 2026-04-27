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

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-white/20 placeholder-white/50";

  // ===== CLICK OUTSIDE =====
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
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // ===== LOAD LANGUAGES =====
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/languages`)
      .then((res) => {
        const langs = res.data.map((l) => `${l.nativeName} (${l.name})`);
        setAllLanguages(langs);
      })
      .catch(() => setAllLanguages([]));
  }, []);

  // ===== ADD LANGUAGE =====
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

  // ===== REMOVE LANGUAGE =====
  const removeLanguage = (lang) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-white space-y-6">
      {/* PROFESSION */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-white/50">{t("Profession")}</label>
        <input
          className={inputBase}
          placeholder={t("Profession")}
          value={form.profession}
          onChange={(e) => handleChange("profession", e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-white/50">{t("Description")}</label>
        <textarea
          className={`${inputBase} h-28 resize-none`}
          placeholder={t("Work description")}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      {/* PRICE */}
      <div className="space-y-3">
        <label className="text-sm text-white/50">{t("Price Type")}</label>
        <div className="flex gap-3 flex-wrap">
          {urgentPriceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange("priceType", opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                form.priceType === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-white/50 border border-white/20"
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
                onChange={(e) =>
                  handleChange("expectedPrice", e.target.value)
                }
                onWheel={(e) => e.target.blur()}
              />
            )}

            {form.priceType === "negotiable" && (
              <div className="flex gap-3">
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

      {/* LANGUAGES */}
      <div className="space-y-2 relative" ref={languageContainerRef}>
        <label className="text-sm text-white/50">{t("Languages")}</label>

        {/* SELECTED */}
        <div className="flex flex-wrap gap-2">
          {form.languages.map((lang, i) => (
            <span
              key={i}
              className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full flex items-center gap-2"
            >
              {lang}
              <button
                type="button"
                className="text-white/50 hover:text-white"
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
                  (l) =>
                    l.toLowerCase().includes(val.toLowerCase()) &&
                    !form.languages.includes(l)
                )
              );
            } else {
              setLanguageSuggestions(
                allLanguages.filter((l) => !form.languages.includes(l))
              );
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
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl bg-slate-900 border border-white/10 shadow-xl">
            {languageSuggestions.map((lang) => (
              <div
                key={lang}
                className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer"
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
