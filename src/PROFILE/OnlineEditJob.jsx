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

  // ✅ Translation states
  const [translated, setTranslated] = useState({
    profession: null,
    description: null,
  });
  const [loadingTranslate, setLoadingTranslate] = useState(null);

  const currentLang = localStorage.getItem("lang") || "en";

  const languageContainerRef = useRef(null);

  const urgentPriceOptions = [
    { label: t("Fixed Price"), value: "fixed" },
    { label: t("Negotiable"), value: "negotiable" },
  ];

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  /* ================= TRANSLATE ================= */
  const handleTranslate = async (field, text) => {
    if (!text) return;

    try {
      setLoadingTranslate(field);

      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      const data = await res.json();
      const translatedText = data[0].map((item) => item[0]).join("");

      setTranslated((prev) => ({
        ...prev,
        [field]: translatedText,
      }));
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setLoadingTranslate(null);
    }
  };

  /* ================= LOAD LANGUAGES ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/languages`)
      .then((res) => {
        const langs = res.data.map(
          (l) => `${l.nativeName} (${l.name})`
        );
        setAllLanguages(langs);
      })
      .catch(() => setAllLanguages([]));
  }, []);

  /* ================= SYNC FORM ================= */
  useEffect(() => {
    setForm((prev) => ({ ...prev, languages }));
  }, [languages]);

  return (
    <div className="space-y-6 text-white">

      {/* ================= PROFESSION ================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60">
            {t("Profession")}
          </label>

          {form.profession && (
            <button
              onClick={() =>
                handleTranslate("profession", form.profession)
              }
              className="text-xs text-indigo-400 underline hover:text-indigo-300"
            >
              {loadingTranslate === "profession"
                ? "..."
                : t("Translate")}
            </button>
          )}
        </div>

        <input
          className={inputBase}
          placeholder={t("Profession")}
          value={translated.profession || form.profession}
          onChange={(e) =>
            handleChange("profession", e.target.value)
          }
        />
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/60">
            {t("Description")}
          </label>

          {form.description && (
            <button
              onClick={() =>
                handleTranslate("description", form.description)
              }
              className="text-xs text-indigo-400 underline hover:text-indigo-300"
            >
              {loadingTranslate === "description"
                ? "..."
                : t("Translate")}
            </button>
          )}
        </div>

        <textarea
          className={`${inputBase} h-28`}
          placeholder={t("Work description")}
          value={translated.description || form.description}
          onChange={(e) =>
            handleChange("description", e.target.value)
          }
        />
      </div>

      {/* ================= PRICE ================= */}
      <div className="space-y-3">
        <label className="text-sm text-white/60">
          {t("Pricing")}
        </label>

        <div className="flex gap-3 flex-wrap">
          {urgentPriceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                handleChange("priceType", opt.value)
              }
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
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
              onChange={(e) =>
                handleChange("currency", e.target.value)
              }
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
              />
            )}

            {form.priceType === "negotiable" && (
              <div className="flex gap-3">
                <input
                  type="number"
                  className={inputBase}
                  placeholder={t("Min")}
                  value={form.minPrice}
                  onChange={(e) =>
                    handleChange("minPrice", e.target.value)
                  }
                />
                <input
                  type="number"
                  className={inputBase}
                  placeholder={t("Max")}
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
      <div className="space-y-3" ref={languageContainerRef}>
        <p className="text-sm text-white/60">
          {t("Languages Required")}
        </p>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang, i) => (
            <span
              key={i}
              className="bg-indigo-600 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
            >
              {lang}
              <button
                className="text-xs hover:text-red-300"
                onClick={() =>
                  setLanguages((l) =>
                    l.filter((x) => x !== lang)
                  )
                }
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <input
          className={inputBase}
          placeholder={t("Add language")}
          value={languageInput}
          onChange={(e) => {
            const val = e.target.value;
            setLanguageInput(val);

            setLanguageSuggestions(
              allLanguages.filter(
                (l) =>
                  l.toLowerCase().includes(val.toLowerCase()) &&
                  !languages.includes(l)
              )
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && languageInput.trim()) {
              setLanguages((prev) => [
                ...prev,
                languageInput.trim(),
              ]);
              setLanguageInput("");
            }
          }}
        />

        {languageSuggestions.length > 0 && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            {languageSuggestions.map((lang) => (
              <div
                key={lang}
                className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                onClick={() => {
                  setLanguages((prev) => [...prev, lang]);
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
    </div>
  );
};

export default OnlineEditJob;
