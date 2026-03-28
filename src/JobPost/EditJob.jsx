import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import CreateOfflineWorkerPostPage from "../PROFILE/CreateOfflineWorkerPostPage";
import L from "leaflet";
import { useRef } from "react";



const emptyForm = {
  profession: "",
  description: "",
  priceType: null,
  expectedPrice: "",
  minPrice: "",
  maxPrice: "",
  currency: "INR",
  preferredTime: null,
  addressDetails: "",
  safetyWarnings: {
    pets: false,
    elderly: false,
    children: false,
    safetyConcerns: false,
  },
  location: { type: "Point", coordinates: [], address: "" },
};

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const inputBase =
    "w-full rounded-xl bg-slate-900 text-white px-4 py-3 border border-slate-700";

  /* ================= FETCH JOB ================= */
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, {
          withCredentials: true,
        });

        const job = res.data.job;

        setForm({
          profession: job.profession || "",
          description: job.description || "",
          priceType: job.price?.type || null,
          expectedPrice: job.price?.value || "",
          minPrice: job.price?.min || "",
          maxPrice: job.price?.max || "",
          currency: job.price?.currency || "INR",
          preferredTime: job.preferredTime || null,
          addressDetails: job.addressDetails || "",
          safetyWarnings: job.safetyWarnings || emptyForm.safetyWarnings,
          location: job.location || emptyForm.location,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
  if (!mapRef.current || !form.location?.coordinates?.length) return;

  const [lng, lat] = form.location.coordinates;

  markerRef.current?.remove();
  markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);

  mapRef.current.setView([lat, lng], 13);
}, [form.location]);

  useEffect(() => {
  if (loading) return; // 🔥 VERY IMPORTANT

  const mapContainer = document.getElementById("map");
  if (!mapContainer || mapRef.current) return;

  mapRef.current = L.map(mapContainer, {
    attributionControl: false,
  }).setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(mapRef.current);

  return () => {
    markerRef.current?.remove();
    mapRef.current?.remove();
    mapRef.current = null;
  };
}, [loading]); // 🔥 add dependency

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getLocation = () => {
     if (!mapRef.current) {
    alert("Map not loaded yet");
    return;
  }
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;

      setForm((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
          address: "Detecting location…",
        },
      }));

      markerRef.current?.remove();
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      mapRef.current.setView([latitude, longitude], 13);

      axios
        .get(`${BASE_URL}/api/hirer-post/geocode?lat=${latitude}&lng=${longitude}`, {
          withCredentials: true,
        })
        .then((res) => {
          setForm((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              address: res.data?.address || "Address not found",
            },
          }));
        })
        .catch(() => alert("Failed to fetch address"))
        .finally(() => setLocationLoading(false));
    },
    () => {
      alert("Location permission denied");
      setLocationLoading(false);
    }
  );
};

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      setSaving(true);

      await axios.put(
        `${BASE_URL}/api/jobs/update/${jobId}`,
        form,
        { withCredentials: true }
      );

      alert("Job updated successfully");
      navigate(`/job/${jobId}`);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="p-6 rounded-3xl bg-slate-900 space-y-6">

        <h1 className="text-xl font-bold">✏️ Edit Job</h1>

        <CreateOfflineWorkerPostPage
          form={form}
          handleChange={handleChange}
          inputBase={inputBase}
          mediaPreviews={[]}
          activeMedia={null}
          setActiveMedia={() => {}}
          fileInputRef={{ current: null }}
          getTodayDate={() => new Date().toISOString().split("T")[0]}
          openNativePicker={() => {}}
          standardPriceOptions={[
            { label: "No Budget", value: null },
            { label: "Fixed Price", value: "fixed" },
            { label: "Hourly", value: "hourly" },
            { label: "Negotiable", value: "negotiable" },
            { label: "Inspect first", value: "inspect_quote" },
          ]}
        />

        {/* ADDRESS */}
        <textarea
          className={inputBase}
          placeholder="Address"
          value={form.addressDetails}
          onChange={(e) =>
            handleChange("addressDetails", e.target.value)
          }
        />

        {/* LOCATION INPUT */}
<input
  className={inputBase}
  readOnly
  onClick={getLocation}
  value={
    form.location.address ||
    (locationLoading
      ? "Detecting location…"
      : "Tap to auto-detect your current location")
  }
/>

{/* MAP */}
<div className="overflow-hidden rounded-xl border border-slate-700">
  <div id="map" style={{ height: 280 }} />
</div>

        {/* SUBMIT */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-indigo-600"
        >
          {saving ? "Updating..." : "Update Job"}
        </button>
      </div>
    </div>
  );
}
