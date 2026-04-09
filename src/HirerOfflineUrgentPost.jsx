import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { useTranslation } from "react-i18next";

import { BASE_URL } from "./config";
import CreateOfflineWorkerPostPage from "./PROFILE/CreateOfflineWorkerPostPage";

/* ================= EMPTY FORM ================= */
const emptyForm = () => ({
  profession: "",
  description: "",
  priceType: null,
  expectedPrice: "",
  minPrice: "",
  maxPrice: "",
  currency: "INR",
  postType: "normal",
  media: [],
  preferredTime: null,
  addressDetails: "",
  safetyWarnings: {
    pets: false,
    elderly: false,
    children: false,
    safetyConcerns: false,
  },
  location: {
    type: "Point",
    coordinates: [],
    address: "",
  },
});

const HirerOfflineUrgentPost = () => {
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const { t } = useTranslation();

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700/60 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

  /* ================= MAP INIT ================= */
  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapRef.current) return;

    mapRef.current = L.map(mapContainer, {
      attributionControl: false,
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      mapRef.current
    );

    return () => {
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (key, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "media") {
      const previews = value.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      }));
      setMediaPreviews(previews);
    }
  };

  const getLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation not supported");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;

      // 1️⃣ Show coordinates immediately
      setForm((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
          address: `Detecting location…`,
        },
      }));

      markerRef.current?.remove();
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      mapRef.current.setView([latitude, longitude], 13);

      // 2️⃣ Fetch human-readable address asynchronously
      axios
        .get(`${BASE_URL}/api/hirer-post/geocode?lat=${latitude}&lng=${longitude}`, {
          withCredentials: true,
        })
        .then((res) => {
          const address = res.data?.address || "Address not found";
          setForm((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              address,
            },
          }));
        })
        .catch(() => {
          setError("Failed to fetch address");
        })
        .finally(() => {
          setLocationLoading(false);
        });
    },
    () => {
      setError("Location permission denied");
      setLocationLoading(false);
    }
  );
};

  /* ================= HELPERS ================= */
  const getTodayDate = () =>
    new Date().toISOString().split("T")[0];

  const openNativePicker = (e) => {
    try {
      e.target.showPicker?.();
    } catch {}
  };

  const standardPriceOptions = [
    { label: t("No Budget"), value: null },
    { label: t("Fixed Price"), value: "fixed" },
    { label: t("Hourly"), value: "hourly" },
    { label: t("Negotiable"), value: "negotiable" },
    { label: t("Inspect first, then quote"), value: "inspect_quote" },
  ];

  const submit = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key === "media") return;
      if (typeof form[key] === "object") {
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    form.media.forEach((file) => formData.append("media", file));

   const res = await axios.post(`${BASE_URL}/api/hirer-post/create`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newPostId = res.data.job._id;

    // 2️⃣ Then, navigate to the urgent matches page (GET)
    navigate(`/urgent-matches/${newPostId}`);
  } catch (err) {
    console.error("Submit error:", err);
    setError("Failed to create post");
  } finally {
    setLoading(false);
  }
};

  /* ================= RENDER ================= */
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
     
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-xl space-y-6">

      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
  🧰 {t("Create OFFLINE Worker Post")}
</h1>

<p className="text-sm text-slate-400">
  {t("Post a job for electricians, plumbers, painters, carpenters and other offline workers.")}
</p>

        {error && (
          <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <CreateOfflineWorkerPostPage
          form={form}
          handleChange={handleChange}
          inputBase={inputBase}
          mediaPreviews={mediaPreviews}
          activeMedia={activeMedia}
          setActiveMedia={setActiveMedia}
          fileInputRef={fileInputRef}
          getTodayDate={getTodayDate}
          openNativePicker={openNativePicker}
          standardPriceOptions={standardPriceOptions}
        />

        {/* ================= EXACT ADDRESS ================= */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            📍 {t("Exact Address / Nearby Landmark")}
          </p>

          <textarea
            className={`${inputBase} h-32 resize-none overflow-y-auto`}
            placeholder={t("Flat / House number, Building name Street / Area Nearby landmark Floor, gate, lift, access notes")}
            value={form.addressDetails}
            maxLength={500}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                addressDetails: e.target.value,
              }))
            }
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>{t("Visible only after job acceptance.")}</span>
            <span>{form.addressDetails.length}/500</span>
          </div>
        </div>

        <input
          className={`${inputBase} cursor-pointer`}
          readOnly
          onClick={getLocation}
          value={
            form.location.address ||
            (locationLoading
              ? t("Detecting location…")
              : t("Tap to auto-detect your current location"))
          }
        />

        <div className="overflow-hidden rounded-xl border border-slate-700">
          <div id="map" style={{ height: 280 }} />
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500"
        >
          {loading ? t("Please wait...") : t("Submit Job Post")}
        </button>

      </div>
    </div>
  );
};

export default HirerOfflineUrgentPost;
