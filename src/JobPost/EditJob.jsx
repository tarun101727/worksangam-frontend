
import { useEffect, useState } from "react";
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

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
