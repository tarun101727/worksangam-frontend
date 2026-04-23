import { useTranslation } from "react-i18next";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { BASE_URL } from "./config";

const getImageUrl = (img) => {
  if (!img) return "";

  if (img.startsWith("http")) return img; // Cloudinary / external

  return `${BASE_URL}${img}`; // local
};

const HirerOfflineUrgentMatches = () => {
  const { postId } = useParams();

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [hirerPost, setHirerPost] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [radius, setRadius] = useState(1000); // initial 1 km
  const [searching, setSearching] = useState(true);
  const [maxRadiusReached, setMaxRadiusReached] = useState(false);
  const circleRef = useRef(null);
const maxAnimatedRadius = 2000; // 2 km max for the blinking animation
    const { t } = useTranslation();


/* ================= BLINKING RADIUS ANIMATION (SLOW & SMOOTH) ================= */
useEffect(() => {
  if (!markerRef.current || !mapRef.current) return;

  // Initialize the circle
  circleRef.current = L.circle(markerRef.current.getLatLng(), {
    radius: 0,
    color: "#4f46e5",
    fillColor: "#4f46e5",
    fillOpacity: 0.2,
    weight: 2,
  }).addTo(mapRef.current);

  let startTime = null;

  const duration = 2000; // 2 seconds for full expansion
  const maxRadius = maxAnimatedRadius;

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Calculate smooth radius using ease-in-out (optional)
    const progress = Math.min(elapsed / duration, 1);
    const radiusValue = maxRadius * progress;

    circleRef.current.setRadius(radiusValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Reset and repeat
      startTime = null;
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);

  return () => {
    circleRef.current?.remove();
    circleRef.current = null;
  };
}, [markerRef.current]);

  /* ================= INIT MAP ================= */
  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapRef.current) return;

    mapRef.current = L.map(mapContainer, { attributionControl: false }).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);

    return () => {
      markerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
  const fetchHirerPost = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/hirer-post/urgent-matches/${postId}`,
        { withCredentials: true }
      );

      let post = res.data.hirer;

      const lng = post.location?.coordinates?.[0] || 78.9629;
      const lat = post.location?.coordinates?.[1] || 20.5937;

      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      mapRef.current.setView([lat, lng], 13);

      // Use the actual location.address first
      const locationAddress = post.location?.address || post.addressDetails || "Address not provided";

      // Build price object
      const price = {
        type: post.priceType || "not_added",
        value: post.expectedPrice || null,
        min: post.minPrice || null,
        max: post.maxPrice || null,
        currency: post.currency || "INR",
      };

      setHirerPost({
        ...post,
        location: {
          type: "Point",
          coordinates: [lng, lat],
          address: locationAddress, // ✅ keep actual location address
        },
        addressDetails: post.addressDetails || "",
        price,
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchHirerPost();
}, [postId]);

  /* ================= AUTO EXPAND RADIUS ================= */
  useEffect(() => {
    if (!searching) return;

    const interval = setInterval(async () => {
      if (!hirerPost) return;

      const nextRadius = radius + 1000; // expand 1 km
      if (nextRadius > 10000) {
        setMaxRadiusReached(true);
        clearInterval(interval);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/hirer-post/urgent-search`, {
          withCredentials: true,
          params: {
            profession: hirerPost.profession,
            lat: markerRef.current.getLatLng().lat,
            lng: markerRef.current.getLatLng().lng,
            radius: nextRadius,
          },
        });

        if (res.data.employees.length) {
          setEmployees(res.data.employees);
          setSearching(false);
          clearInterval(interval);
        } else {
          setRadius(nextRadius);
        }
      } catch (err) {
        console.error(err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [searching, radius, hirerPost]);

  /* ================= MANUAL EXPAND ================= */
  const handleSearchMore = async () => {
    if (!hirerPost) return;
    const nextRadius = radius + 5000; // expand 5 km
    try {
      const res = await axios.get(`${BASE_URL}/api/hirer-post/urgent-search`, {
        withCredentials: true,
        params: {
          profession: hirerPost.profession,
          lat: markerRef.current.getLatLng().lat,
          lng: markerRef.current.getLatLng().lng,
          radius: nextRadius,
        },
      });

      if (res.data.employees.length) {
        setEmployees((prev) => {
          const ids = prev.map((e) => e._id);
          const newEmps = res.data.employees.filter((e) => !ids.includes(e._id));
          return [...prev, ...newEmps];
        });
      }

      setRadius(nextRadius);
      if (res.data.employees.length === 0 && nextRadius >= 10000) {
        setMaxRadiusReached(true);
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  if (searching && employees.length === 0) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

  /* ================= RENDER ================= */
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {hirerPost && (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-xl space-y-4 max-w-full">
    {/* Profile */}
    <div className="flex items-center gap-4">
      <img
          src={hirerPost.profileImage ? getImageUrl(hirerPost.profileImage) : "/default-avatar.png"}
        alt={`${hirerPost.firstName} ${hirerPost.lastName}`}
        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
      />
      <div>
        <p className="text-white font-semibold text-lg leading-tight">
          {hirerPost.firstName} {hirerPost.lastName}
        </p>
        <p className="text-indigo-400 font-bold text-sm leading-snug">
          {t("Profession")}: {hirerPost.profession}
        </p>
      </div>
    </div>

    {/* Description */}
    {hirerPost.description && (
      <p className="text-slate-300 text-sm leading-relaxed break-words whitespace-pre-wrap max-w-full">
        <span className="font-semibold text-indigo-400">{t("Description")}:</span> {hirerPost.description}
      </p>
    )}

    {/* Preferred Time */}
    {hirerPost.preferredTime && (
      <p className="text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">
        ⏱️ <span className="font-semibold text-indigo-400">{t("Preferred Time")}:</span>{" "}
        {hirerPost.preferredTime.type === "asap"
          ? t("Immediately")
          : hirerPost.preferredTime.type === t("today")
          ? `Today (${hirerPost.preferredTime.date})`
          : `Custom: ${hirerPost.preferredTime.from} to ${hirerPost.preferredTime.to}`}
      </p>
    )}

    {/* Media */}
    {hirerPost.media?.length > 0 && (
      <div className="grid grid-cols-3 gap-3">
        {hirerPost.media.map((m, idx) => (
          <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-700">
            {m.type === "image" ? (
              <img
                src={getImageUrl(m.url)}
                alt="media"
                className="w-full h-24 object-cover"
              />
            ) : (
              <video
                src={getImageUrl(m.url)}
                className="w-full h-24 object-cover"
                controls
              />
            )}
          </div>
        ))}
      </div>
    )}

    {/* Safety Warnings */}
    {hirerPost.safetyWarnings && Object.keys(hirerPost.safetyWarnings).length > 0 && (
      <div className="flex flex-wrap gap-2">
        <h1 className="text-white font-semibold text-sm">{t("Warning")}:</h1>
        {hirerPost.safetyWarnings.pets && (
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">{t("Pets at home")}</span>
        )}
        {hirerPost.safetyWarnings.elderly && (
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">{t("Elderly person")}</span>
        )}
        {hirerPost.safetyWarnings.children && (
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">{t("Children present")}</span>
        )}
        {hirerPost.safetyWarnings.safetyConcerns && (
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">{t("Safety concerns")}</span>
        )}
      </div>
    )}

    {/* Price */}
    {hirerPost.price && (
      <p className="text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">
        💰 <span className="font-semibold text-indigo-400">{t("Price")}:</span>{" "}
        {hirerPost.price.type === "not_added"
          ? t("Not added")
          : hirerPost.price.type === t("fixed")
          ? `${hirerPost.price.value} ${hirerPost.price.currency}`
          : hirerPost.price.type === t("hourly")
          ? `${hirerPost.price.value} ${hirerPost.price.currency}/hr`
          : hirerPost.price.type === t("negotiable")
          ? `${hirerPost.price.min}-${hirerPost.price.max} ${hirerPost.price.currency}`
          : t("Inspect & Quote")}
      </p>
    )}

    {/* Address */}
    <div className="space-y-2">
      {hirerPost.addressDetails && (
        <p className="text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">
          <span className="font-semibold text-indigo-400">📍 {t("Landmark / Extra Address")}:</span> {hirerPost.addressDetails}
        </p>
      )}
      {hirerPost.location?.address && hirerPost.location.address !== hirerPost.addressDetails && (
        <p className="text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">
          <span className="font-semibold text-indigo-400">🗺️ {t("Full Address")}:</span> {hirerPost.location.address}
        </p>
      )}
    </div>
  </div>
)}

      {/* Map & Radius */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-xl space-y-3">
        <p className="text-slate-400">
          {t("Searching for")} {hirerPost?.profession || ""} {t("within")} {Math.round(radius / 1000)} {t("km...")}
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-700">
          <div id="map" style={{ height: 300 }} />
        </div>
      </div>

      {/* Employee Matches */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/50 shadow-xl space-y-4">
        <h3 className="text-lg font-semibold text-white">{t("Matching Employees")}</h3>
        {employees.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {employees.map((e) => (
              <div key={e._id} className="p-4 bg-slate-800 rounded-xl flex items-center gap-3">
                <img
                  src={e.profileImage ? getImageUrl(e.profileImage) : "/default-avatar.png"}
                  alt={e.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">{e.name}</p>
                  <p className="text-slate-400 text-sm">{e.profession}</p>
                  <p className="text-slate-500 text-xs">{Math.round(e.distance / 1000)} km away</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">{t("No employees found yet...")}</p>
        )}

        {!maxRadiusReached && (
          <button
            onClick={handleSearchMore}
            className="mt-4 w-full py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500"
          >
            {t("Search for more employees")}
          </button>
        )}
      </div>
    </div>
  );
};

export default HirerOfflineUrgentMatches;
