import { BASE_URL } from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { currencies } from "../constants/currencies";
import { useTranslation } from "react-i18next";


const CreateOfflineWorkerPostPage = ({
  form,
  handleChange,
  inputBase,
  mediaPreviews,
  activeMedia,
  setActiveMedia,
  fileInputRef,
  getTodayDate,
  openNativePicker,
  standardPriceOptions,
}) => {
  const selectedCurrency = currencies.find(
    (c) => c.code === form.currency
  );

  const [onlineProfessions, setOnlineProfessions] = useState([]);
const [search, setSearch] = useState("");
const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useTranslation();


useEffect(() => {
  const fetchProfessions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/offline-professions`);

      setOnlineProfessions(res.data.professions || []);
    } catch (err) {
      console.error("Failed to fetch professions" , err );
      setOnlineProfessions([]);
    }
  };

  fetchProfessions();
}, []);

const filteredProfessions = onlineProfessions.filter((p) =>
  p?.name?.toLowerCase().includes(search.toLowerCase())
);
  return (
    <>
     <div className="profession-input relative">
  <input
    type="text"
    className={inputBase}
    placeholder={t("Search online profession")}
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
            key={profession._id}
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
      <textarea
        className={`${inputBase} h-32 resize-none`}
        placeholder={t("Describe your requirement")}
        value={form.description}
        onChange={(e) =>
          handleChange("description", e.target.value)
        }
      />

      {/* ================= PREFERRED TIME ================= */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          ⏱️ {t("Preferred Time & Date")}
        </p>

        <div className="flex gap-3">
          {[
            { label: t("Immediately"), value: "asap" },
            { label: t("Today"), value: "today" },
            { label: t("Select date & time"), value: "custom" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (opt.value === "today") {
                  handleChange("preferredTime", {
                    type: "today",
                    date: getTodayDate(),
                  });
                } else {
                  handleChange("preferredTime", { type: opt.value });
                }
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                form.preferredTime?.type === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {form.preferredTime?.type === "today" && (
          <input
            type="date"
            className={inputBase}
            min={getTodayDate()}
            value={form.preferredTime.date}
            onChange={(e) =>
              handleChange("preferredTime", {
                ...form.preferredTime,
                date: e.target.value,
              })
            }
          />
        )}

        {form.preferredTime?.type === "custom" && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="date"
                className={inputBase}
                min={getTodayDate()}
                onClick={openNativePicker}
                onChange={(e) =>
                  handleChange("preferredTime", {
                    ...form.preferredTime,
                    fromDate: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className={inputBase}
                min={form.preferredTime?.fromDate || getTodayDate()}
                onClick={openNativePicker}
                onChange={(e) =>
                  handleChange("preferredTime", {
                    ...form.preferredTime,
                    toDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3">
              <input
                type="time"
                className={inputBase}
                onClick={openNativePicker}
                onChange={(e) =>
                  handleChange("preferredTime", {
                    ...form.preferredTime,
                    fromTime: e.target.value || null,
                  })
                }
              />

              <input
                type="time"
                className={inputBase}
                onClick={openNativePicker}
                onChange={(e) =>
                  handleChange("preferredTime", {
                    ...form.preferredTime,
                    toTime: e.target.value || null,
                  })
                }
              />
            </div>

            <p className="text-xs text-slate-500">
              {t("Time is optional. You may select only dates.")}
            </p>
          </div>
        )}
      </div>

      {/* ================= MEDIA UPLOAD ================= */}
<div className="space-y-3">
  <p className="text-sm text-slate-400">
    📸 {t("Upload photos or a short video (optional)")}
  </p>

  {/* HIDDEN FILE INPUT */}
  <input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/*"
  capture="environment" // this prompts camera option on mobile
  multiple
  className="hidden"
 onChange={(e) => {
  const files = Array.from(e.target.files).slice(0, 6); // max 6

  // append to existing media
  handleChange("media", [...form.media, ...files].slice(0, 6));

  // append to existing previews
  const previews = files.map((file) => ({
    url: URL.createObjectURL(file),
    type: file.type.startsWith("video") ? "video" : "image",
  }));
  handleChange(
    "mediaPreviews",
    [...mediaPreviews, ...previews].slice(0, 6)
  );
}}
/>

  {/* ADD BUTTON */}
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="w-full py-3 rounded-xl border border-dashed border-slate-600
               text-slate-300 hover:border-indigo-500 hover:text-indigo-400
               transition font-semibold"
  >
    + {t("ADD IMAGE & VIDEO")}
  </button>

  <p className="text-xs text-slate-500">
    {t("Images or one short video (10–30 sec). Max 6 files.")}
  </p>

  {/* PREVIEW GRID */}
  {mediaPreviews.length > 0 && (
    <div className="grid grid-cols-3 gap-3">
      {mediaPreviews.map((media, index) => (
        <div
          key={index}
          className="relative rounded-lg overflow-hidden border border-slate-700 cursor-pointer group"
          onClick={() => setActiveMedia(media)}
        >
          {media.type === "image" ? (
            <img
              src={media.url}
              alt="preview"
              className="w-full h-24 object-cover transition group-hover:scale-105"
            />
          ) : (
            <video
              src={media.url}
              muted
              className="w-full h-24 object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0
                          group-hover:opacity-100 flex items-center
                          justify-center text-xs text-white">
            {t("Click to view")}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* ================= MEDIA ENLARGE MODAL ================= */}
{activeMedia && (
  <div
    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    onClick={() => setActiveMedia(null)}
  >
    <div
      className="max-w-4xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {activeMedia.type === "image" ? (
        <img
          src={activeMedia.url}
          alt="Full preview"
          className="w-full max-h-[90vh] object-contain rounded-xl"
        />
      ) : (
        <video
          src={activeMedia.url}
          controls
          autoPlay
          className="w-full max-h-[90vh] rounded-xl"
        />
      )}
    </div>
  </div>
)}

      {/* ================= SAFETY WARNINGS ================= */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          🚫 {t("Special Conditions / Warnings")}
        </p>

        {[
         { key: "pets", label: t("pets") },
  { key: "elderly", label: t("elderly") },
  { key: "children", label: t("children") },
  { key: "safetyConcerns", label: t("safetyConcerns") },
        ].map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={form.safetyWarnings[item.key]}
              onChange={(e) =>
                handleChange("safetyWarnings", {
                  ...form.safetyWarnings,
                  [item.key]: e.target.checked,
                })
              }
              className="accent-indigo-500 w-4 h-4"
            />
            <span className="text-sm text-slate-200">
              {item.label}
            </span>
          </label>
        ))}
      </div>

      

{/* ================= PRICE ================= */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          {t("Price (optional)")}
        </p>

        <div className="grid grid-cols-3 gap-3">
  {standardPriceOptions.map((opt) => (
    <button
      key={opt.value ?? "no-budget"}
      onClick={() =>
        handleChange("priceType", opt.value)
      }
      className={`py-2 rounded-lg text-sm font-semibold ${
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
    {/* Currency */}
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

    {/* FIXED PRICE */}
    {form.priceType === "fixed" && (
      <input
  type="number"
  className={inputBase}
  placeholder={`${t("fixed_price")} (${selectedCurrency?.symbol})`}
  value={form.expectedPrice}
  onChange={(e) =>
    handleChange("expectedPrice", e.target.value)
  }
/>
    )}

    {/* HOURLY */}
    {form.priceType === "hourly" && (
      <input
  type="number"
  className={inputBase}
  placeholder={`${t("hourly_rate")} (${selectedCurrency?.symbol}/hr)`}
  value={form.expectedPrice}
  onChange={(e) =>
    handleChange("expectedPrice", e.target.value)
  }
/>
    )}

    {/* NEGOTIABLE */}
    {form.priceType === "negotiable" && (
      <div className="flex gap-3">
        <input
          type="number"
          className={inputBase}
          placeholder={t("min_price")}
          value={form.minPrice}
          onChange={(e) =>
            handleChange("minPrice", e.target.value)
          }
        />
        <input
          type="number"
          className={inputBase}
          placeholder={t("max_price")}
          value={form.maxPrice}
          onChange={(e) =>
            handleChange("maxPrice", e.target.value)
          }
        />
      </div>
    )}

    {/* INSPECT FIRST */}
    {form.priceType === "inspect_quote" && (
      <p className="text-xs text-slate-500">
        💡 {t("The worker will inspect the job and quote the price later.")}
      </p>
    )}
  </>
)}
      </div>
    </>
  );
};

export default CreateOfflineWorkerPostPage;
