import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";

const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};


export default function OfflineJobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!jobId) return;

  const fetchJob = async () => {
    try {
      setLoading(true); // ✅ start spinner

      const res = await axios.get(
        `${BASE_URL}/api/jobs/${jobId}`,
        { withCredentials: true }
      );

      setJob(res.data.job);
    } catch {
      setError("Failed to load job details");
    } finally {
      setLoading(false); // ✅ stop spinner
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
          <p className="text-xs text-white/50">Job posted by {job.hirer?.firstName}</p>
        </div>
      </div>

      {/* Job Card */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        {/* Profession */}
        <h1 className="text-2xl font-bold">
          Profession: <span className="text-indigo-300 capitalize">{job.profession}</span>
        </h1>

        {/* Description */}
        <p className="text-white/70">{job.description}</p>

        {/* Preferred Time & Date */}
        {job.preferredTime && (
          <p className="text-white/60">
            <span className="font-semibold">Preferred Time: </span>
            {job.preferredTime.type === "asap" && "As soon as possible"}
            {job.preferredTime.type === "today" && "Today"}
            {job.preferredTime.type === "custom" && (
              <>
                {new Date(job.preferredTime.from).toLocaleString()} — {new Date(job.preferredTime.to).toLocaleString()}
              </>
            )}
          </p>
        )}

        {/* Media */}
        {job.media?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-white/80 mb-3">Media</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {job.media.map((m, i) =>
                m.type === "image" ? (
                  <img
                    key={i}
                    src={getImageUrl(m.url)}
                    alt="job"
                    onClick={() => setSelectedMedia(m)}
                    className="h-28 w-full object-cover rounded-xl cursor-pointer hover:opacity-80"
                  />
                ) : (
                  <video
                    key={i}
                    onClick={() => setSelectedMedia(m)}
                    className="h-28 w-full object-cover rounded-xl cursor-pointer"
                  >
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
            <p className="font-semibold text-red-400 mb-2">Warnings</p>
            <div className="text-sm text-red-300 space-y-1">
              {job.safetyWarnings.children && <p>• Children present</p>}
              {job.safetyWarnings.elderly && <p>• Elderly present</p>}
              {job.safetyWarnings.pets && <p>• Pets present</p>}
              {job.safetyWarnings.safetyConcerns && <p>• Safety concerns</p>}
            </div>
          </div>
        )}

        {/* Price */}
        {job.price && (
          <p className="text-xl font-bold text-yellow-400">
            {job.price.type === "fixed" && `${job.price.currency} ${job.price.value}`}
            {job.price.type === "hourly" && `${job.price.currency} ${job.price.value}/hr`}
            {job.price.type === "negotiable" && `${job.price.currency} ${job.price.min} – ${job.price.max}`}
            {job.price.type === "inspect_quote" && "Inspect & Quote"}
          </p>
        )}

        {/* Address */}
        {job.addressDetails && (
          <p className="text-white/60"><span className="font-semibold">Address / Landmark: </span>{job.addressDetails}</p>
        )}

        {/* Current Location */}
        {job.location?.address && (
          <p className="text-white/60"><span className="font-semibold">Current Location: </span>{job.location.address}</p>
        )}
      </div>

      {/* Back & Chat */}
      <div className="mt-6 flex gap-4">
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">Back</button>

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
