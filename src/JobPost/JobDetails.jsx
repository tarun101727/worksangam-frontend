import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};

export default function JobDetails() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // 🔥 TRANSLATION STATE
  const [translated, setTranslated] = useState({
    profession: null,
    description: null,
  });
  const [loadingTranslate, setLoadingTranslate] = useState(null);

  const currentLang = localStorage.getItem("lang") || "en";

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

  // 🔥 FETCH JOB
  const fetchJob = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}`, {
        withCredentials: true,
      });
      setJob(res.data.job);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, []);

  // 🔥 DELETE JOB
  const handleDelete = async () => {
    if (!window.confirm(t("delete_confirm"))) return;

    try {
      await axios.delete(`${BASE_URL}/api/jobs/delete/${jobId}`, {
        withCredentials: true,
      });

      alert(t("job_deleted"));
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(t("delete_failed"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) return <p className="text-center mt-10">{t("job_not_found")}</p>;

  const isOnline = job.professionType === "online";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5 bg-[#0F172A] rounded-2xl border border-white/10">

      {/* HEADER */}
      <div className="flex items-center gap-5 pb-6 border-b border-white/10 mb-8">
        {job.hirer?.profileImage ? (
          <img
            src={getImageUrl(job.hirer.profileImage)}
            alt={job.hirer.firstName}
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
            {job.hirer?.firstName} {job.hirer?.lastName}
          </p>
          <p className="text-xs text-white/50">
            {t("job_posted_by", { name: job.hirer?.firstName })}
          </p>
        </div>
      </div>

      {/* JOB CARD */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">

        {/* 🔵 PROFESSION */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {translated.profession || job.profession}
          </h1>

          <button
            onClick={() => handleTranslate("profession", job.profession)}
            className="text-sm text-indigo-400 underline"
          >
            {loadingTranslate === "profession" ? "..." : t("Translate")}
          </button>
        </div>

        {/* 🔵 DESCRIPTION */}
        <div className="flex items-center gap-3">
          <p className="text-white/70">
            {translated.description || job.description}
          </p>

          <button
            onClick={() => handleTranslate("description", job.description)}
            className="text-sm text-indigo-400 underline"
          >
            {loadingTranslate === "description" ? "..." : t("Translate")}
          </button>
        </div>

        {/* 🔵 ONLINE */}
        {isOnline && job.languages?.length > 0 && (
          <p className="text-white/60">
            {t("Languages")}: {job.languages.join(", ")}
          </p>
        )}

        {/* 🔵 PRICE */}
        {job.price && (
          <p className="text-xl font-bold text-yellow-400">
            {job.price.type === "fixed" &&
              `${job.price.currency} ${job.price.value}`}
            {job.price.type === "hourly" &&
              `${job.price.currency} ${job.price.value}/hr`}
            {job.price.type === "negotiable" &&
              `${job.price.currency} ${job.price.min} – ${job.price.max}`}
          </p>
        )}

        {/* 🔵 MEDIA (OFFLINE ONLY) */}
        {!isOnline && job.media?.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {job.media.map((m, i) =>
              m.type === "image" ? (
                <img
                  key={i}
                  src={getImageUrl(m.url)}
                  onClick={() => setSelectedMedia(m)}
                  className="h-24 w-full object-cover rounded-lg cursor-pointer"
                />
              ) : (
                <video
                  key={i}
                  onClick={() => setSelectedMedia(m)}
                  className="h-24 w-full object-cover rounded-lg cursor-pointer"
                >
                  <source src={getImageUrl(m.url)} />
                </video>
              )
            )}
          </div>
        )}
      </div>

      {/* 🔥 ACTION BUTTONS */}
      <div className="mt-6 flex gap-4 flex-wrap">

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 rounded-lg bg-gray-700"
        >
          {t("Back")}
        </button>

        <button
          onClick={async () => {
            const res = await axios.post(
              `${BASE_URL}/api/chat/create/${job.hirer._id}`,
              {},
              { withCredentials: true }
            );
            navigate(`/chat/${res.data._id}`);
          }}
          className="px-5 py-2 rounded-xl bg-green-500"
        >
          {t("chat_with_user", { name: job.hirer.firstName })}
        </button>

        <button
          onClick={() => navigate(`/edit-job/${job._id}`)}
          className="px-5 py-2 rounded-xl bg-blue-500"
        >
          {t("Edit")}
        </button>

        <button
          onClick={handleDelete}
          className="px-5 py-2 rounded-xl bg-red-500"
        >
          {t("Delete")}
        </button>
      </div>

      {/* FULLSCREEN MEDIA */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
          onClick={() => setSelectedMedia(null)}
        >
          {selectedMedia.type === "image" ? (
            <img
              src={getImageUrl(selectedMedia.url)}
              className="max-h-[90vh]"
            />
          ) : (
            <video controls className="max-h-[90vh]">
              <source src={getImageUrl(selectedMedia.url)} />
            </video>
          )}
        </div>
      )}
    </div>
  );
}
