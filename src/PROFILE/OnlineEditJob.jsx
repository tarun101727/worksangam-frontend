// OnlineEditJob.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { currencies } from "../constants/currencies";
import { useTranslation } from "react-i18next";

const OnlineEditJob = ({ form, setForm, handleChange }) => {
  const { t } = useTranslation();

  const [languages, setLanguages] = useState(form.languages || []);
  const [languageInput, setLanguageInput] = useState("");
  const [allLanguages, setAllLanguages] = useState([]);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);

  const languageContainerRef = useRef(null);

  const urgentPriceOptions = [
    { label: t("Fixed Price"), value: "fixed" },
    { label: t("Negotiable"), value: "negotiable" },
  ];

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700";

  /* ================= LOAD LANGUAGES ================= */
  useEffect(() => {
    axios.get(`${BASE_URL}/api/languages`)
      .then(res => {
        const langs = res.data.map(l => `${l.nativeName} (${l.name})`);
        setAllLanguages(langs);
      })
      .catch(() => setAllLanguages([]));
  }, []);

  /* ================= SYNC FORM ================= */
  useEffect(() => {
    setForm(prev => ({ ...prev, languages }));
  }, [languages]);

  return (
    <>
      {/* PROFESSION */}
      <input
        className={inputBase}
        placeholder="Profession"
        value={form.profession}
        onChange={(e) => handleChange("profession", e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className={`${inputBase} h-28`}
        placeholder="Work description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* ================= PRICE (UPDATED UI) ================= */}
      <div className="space-y-3">

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
                placeholder="Fixed price"
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
                  placeholder="Min"
                  value={form.minPrice}
                  onChange={(e) =>
                    handleChange("minPrice", e.target.value)
                  }
                />
                <input
                  type="number"
                  className={inputBase}
                  placeholder="Max"
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

      {/* ================= LANGUAGES ================= */}
      <div ref={languageContainerRef} className="space-y-2">
        <p className="text-sm text-red-400">Languages Required</p>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang, i) => (
            <span key={i} className="bg-indigo-600 px-3 py-1 rounded-full flex items-center gap-2">
              {lang}
              <button onClick={() => setLanguages(l => l.filter(x => x !== lang))}>✕</button>
            </span>
          ))}
        </div>

        <input
          className={inputBase}
          placeholder="Add language"
          value={languageInput}
          onChange={(e) => {
            const val = e.target.value;
            setLanguageInput(val);

            setLanguageSuggestions(
              allLanguages.filter(l =>
                l.toLowerCase().includes(val.toLowerCase()) &&
                !languages.includes(l)
              )
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && languageInput.trim()) {
              setLanguages(prev => [...prev, languageInput.trim()]);
              setLanguageInput("");
            }
          }}
        />

        {languageSuggestions.length > 0 && (
          <div className="bg-slate-900 border rounded-xl">
            {languageSuggestions.map((lang) => (
              <div
                key={lang}
                className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                onClick={() => {
                  setLanguages(prev => [...prev, lang]);
                  setLanguageInput("");
                  setLanguageSuggestions([]);
                }}
              >
                {lang}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OnlineEditJob;