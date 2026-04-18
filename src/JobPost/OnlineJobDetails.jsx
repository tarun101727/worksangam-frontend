import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};

export default function OnlineJobDetails() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  // Translation states
  const [translated, setTranslated] = useState({ profession: null, description: null });
  const [loadingTranslate, setLoadingTranslate] = useState(null);
  const currentLang = localStorage.getItem("lang") || "en";

  const handleTranslate = async (field, text) => {
    if (!text) return;
    try {
      setLoadingTranslate(field);
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      const translatedText = data[0].map((item) => item[0]).join("");
      setTranslated((prev) => ({ ...prev, [field]: translatedText }));
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setLoadingTranslate(null);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, { withCredentials: true });
        setJob(res.data.job);
      } catch {
        setError("Failed to load job details");
      }
    };
    fetchJob();
  }, [jobId]);

  const applyJob = async () => {
    if (applying) return;
    try {
      setApplying(true);
      await axios.post(`${BASE_URL}/api/jobs/apply/${job._id}`, {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  if (error) return <p className="text-red-400 text-center">{error}</p>;
  if (!job) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-white">
      <div className="flex items-center gap-5 pb-6 border-b border-white/10 mb-8">
        {job.hirer?.profileImage ? (
          <img
            src={getImageUrl(job.hirer.profileImage)}
            alt={job.hirer.firstName || "Hirer"}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: job.hirer?.avatarColor || "#334155" }}
          >
            {job.hirer?.avatarInitial || "H"}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold">
            {job.hirer?.firstName || "Unknown"} {job.hirer?.lastName || ""}
          </p>
          <p className="text-xs text-white/50">
            Job posted by {job.hirer?.firstName || "Unknown"}
          </p>
        </div>
      </div>

      {/* Job Card */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        {/* Profession */}
        <h1 className="text-2xl font-bold">
          Profession:{" "}
          <span className="text-indigo-300 capitalize">
            {translated.profession || job.profession}
          </span>
        </h1>
        {job.profession && (
          <button
            onClick={() => handleTranslate("profession", job.profession)}
            className="text-sm text-indigo-400"
          >
            {loadingTranslate === "profession" ? "..." : t("Translate")}
          </button>
        )}

        {/* Description */}
        <p className="text-white/70 mt-2">
          {translated.description || job.description}
        </p>
        {job.description && (
          <button
            onClick={() => handleTranslate("description", job.description)}
            className="text-sm text-indigo-400"
          >
            {loadingTranslate === "description" ? "..." : t("Translate")}
          </button>
        )}

        {/* Languages */}
        {job.languages?.length > 0 && (
          <div>
            <p className="text-white/50 font-semibold mb-1">Languages Required:</p>
            <div className="flex gap-2 flex-wrap">
              {job.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 rounded-full bg-slate-700 text-white text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {job.price && (
          <p className="text-xl font-bold text-yellow-400">
            {job.price.type === "fixed" && `${job.price.currency} ${job.price.value}`}
            {job.price.type === "negotiable" &&
              `${job.price.currency} ${job.price.min} – ${job.price.max}`}
          </p>
        )}
      </div>

      {/* Back & Chat */}
      <div className="mt-6 flex gap-4">
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          Back
        </button>

        <button
          onClick={async () => {
            const res = await axios.post(`${BASE_URL}/api/chat/create/${job.hirer._id}`, {}, { withCredentials: true });
            navigate(`/chat/${res.data._id}`);
          }}
          className="px-5 py-2 rounded-xl bg-green-500"
        >
          Chat with {job.hirer.firstName}
        </button>

        <button
          onClick={applyJob}
          disabled={applying}
          className="px-5 py-2 rounded-xl bg-indigo-500 disabled:opacity-50"
        >
          {applying ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}
