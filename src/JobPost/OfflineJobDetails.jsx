import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};

export default function OfflineJobDetails() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Translation states
const [translated, setTranslated] = useState({
  profession: null,
  description: null,
  addressDetails: null,    // ✅ add this
  locationAddress: null,   // ✅ add this
});
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
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, { withCredentials: true });
        setJob(res.data.job);
      } catch {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
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
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex items-center gap-5 pb-6 border-b border-white/10 mb-8">
        {job.hirer?.profileImage ? (
          <img src={getImageUrl(job.hirer.profileImage)} alt={job.hirer.firstName} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: job.hirer?.avatarColor || "#334155" }}>
            {job.hirer?.avatarInitial || "H"}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold">{job.hirer?.firstName} {job.hirer?.lastName}</p>
          <p className="text-xs text-white/50">{t("Job posted by")} {job.hirer?.firstName}</p>
        </div>
      </div>

      {/* Job Card */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        {/* Profession */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {t("Profession")}: <span className="text-indigo-300 capitalize">{translated.profession || job.profession}</span>
          </h1>
          {job.profession && (
            <button onClick={() => handleTranslate("profession", job.profession)} className="text-sm text-indigo-400 underline hover:text-indigo-300">
              {loadingTranslate === "profession" ? "..." : t("Translate")}
            </button>
          )}
        </div>

        {/* Description */}
        <div className="flex items-center gap-3 mt-2">
          <span className="font-semibold">{t("Description")} : </span> 
          <p className="text-white/70">{translated.description || job.description}</p>
          {job.description && (
            <button onClick={() => handleTranslate("description", job.description)} className="text-sm text-indigo-400 underline hover:text-indigo-300">
              {loadingTranslate === "description" ? "..." : t("Translate")}
            </button>
          )}
        </div>

        {/* Preferred Time & Date */}
        {job.preferredTime && (
          <p className="text-white/60">
            <span className="font-semibold">{t("Preferred Time")} : </span> 
            {job.preferredTime.type === "asap" && t("As soon as possible")}
            {job.preferredTime.type === "today" && t("Today")}
            {job.preferredTime.type === "custom" && (
              <>{new Date(job.preferredTime.from).toLocaleString()} — {new Date(job.preferredTime.to).toLocaleString()}</>
            )}
          </p>
        )}

        {/* Media */}
        {job.media?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-white/80 mb-3">{t("Media")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {job.media.map((m, i) =>
                m.type === "image" ? (
                  <img key={i} src={getImageUrl(m.url)} alt="job" onClick={() => setSelectedMedia(m)} className="h-28 w-full object-cover rounded-xl cursor-pointer hover:opacity-80" />
                ) : (
                  <video key={i} onClick={() => setSelectedMedia(m)} className="h-28 w-full object-cover rounded-xl cursor-pointer">
                    <source src={getImageUrl(m.url)} />
                  </video>
                )
              )}
            </div>
          </div>
        )}

        {/* Safety Warnings */}
        {job.safetyWarnings && (
          <div className="bg-red-500/10 rounded-xl p-4">
            <p className="font-semibold text-red-400 mb-2">{t("Warnings")}</p>
            <div className="text-sm text-red-300 space-y-1">
              {job.safetyWarnings.children && <p>• {t("Children present")}</p>}
              {job.safetyWarnings.elderly && <p>• {t("Elderly present")}</p>}
              {job.safetyWarnings.pets && <p>• {t("Pets present")}</p>}
              {job.safetyWarnings.safetyConcerns && <p>• {t("Safety concerns")}</p>}
            </div>
          </div>
        )}

        {/* Price */}
        {job.price && (
          <p className="text-xl font-bold text-yellow-400">
            {job.price.type === "fixed" && `${job.price.currency} ${job.price.value}`}
            {job.price.type === "hourly" && `${job.price.currency} ${job.price.value}/hr`}
            {job.price.type === "negotiable" && `${job.price.currency} ${job.price.min} – ${job.price.max}`}
            {job.price.type === "inspect_quote" && t("Inspect & Quote")}
          </p>
        )}

        {/* Address */}
{job.addressDetails && (
  <div className="flex items-center gap-3">
    <p className="text-white/60">
      <span className="font-semibold">{t("Address / Landmark")}:</span> {translated.addressDetails || job.addressDetails}
    </p>
    <button
      onClick={() => handleTranslate("addressDetails", job.addressDetails)}
      className="text-sm text-indigo-400 underline hover:text-indigo-300"
    >
      {loadingTranslate === "addressDetails" ? "..." : t("Translate")}
    </button>
  </div>
)}

{/* Current Location */}
{job.location?.address && (
  <div className="flex items-center gap-3 mt-2">
    <p className="text-white/60">
      <span className="font-semibold">{t("Current Location")}:</span> {translated.locationAddress || job.location.address}
    </p>
    <button
      onClick={() => handleTranslate("locationAddress", job.location.address)}
      className="text-sm text-indigo-400 underline hover:text-indigo-300"
    >
      {loadingTranslate === "locationAddress" ? "..." : t("Translate")}
    </button>
  </div>
)}
      </div>

      {/* Back & Chat / Apply */}
      <div className="mt-6 flex gap-4">
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">
          {t("Back")}
        </button>

        {user?.isGuest ? (
          <div className="flex items-center gap-2 text-sm italic text-gray-400 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0v2m0-2h2m-2 0H8" />
            </svg>
            {t("Login to see chat and apply")}
          </div>
        ) : (
          <>
            <button onClick={async () => {
              const res = await axios.post(`${BASE_URL}/api/chat/create/${job.hirer._id}`, {}, { withCredentials: true });
              navigate(`/chat/${res.data._id}`);
            }} className="px-5 py-2 rounded-xl bg-green-500">
              {t("chat_with_user", { name: job.hirer.firstName })}
            </button>

            <button onClick={applyJob} disabled={applying} className="px-5 py-2 rounded-xl bg-indigo-500 disabled:opacity-50">
              {applying ? t("Applied") : t("Apply")}
            </button>
          </>
        )}
      </div>

      {/* Fullscreen Media */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setSelectedMedia(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMedia(null)} className="absolute -top-10 right-0 text-white text-2xl">✕</button>
            {selectedMedia.type === "image" ? (
              <img src={getImageUrl(selectedMedia.url)} alt="full" className="max-h-[90vh] rounded-lg" />
            ) : (
              <video controls className="max-h-[90vh] rounded-lg">
                <source src={getImageUrl(selectedMedia.url)} />
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
