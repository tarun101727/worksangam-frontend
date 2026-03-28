import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import CreateOfflineWorkerPostPage from "../PROFILE/CreateOfflineWorkerPostPage";

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
}, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setLocationLoading(true);

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const { latitude, longitude } = coords;

      // set coordinates immediately
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

      // fetch readable address
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
          alert("Failed to fetch address");
        })
        .finally(() => {
          setLocationLoading(false);
        });
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

        {/* ================= EXACT ADDRESS ================= */}
<div className="space-y-3">
  <p className="text-sm text-slate-400">
    📍 Exact Address / Nearby Landmark
  </p>

  <textarea
    className={`${inputBase} h-32 resize-none overflow-y-auto`}
    placeholder={`Flat / House number, Building name
Street / Area
Nearby landmark
Floor, gate, lift, access notes`}
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
    <span>Visible only after job acceptance.</span>
    <span>{form.addressDetails.length}/500</span>
  </div>
</div>

{/* LOCATION INPUT */}
<input
  className={`${inputBase} cursor-pointer`}
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
