import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./config";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img}`;
};

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    if (!price) return "Contact for pricing";
    if (price.type === "fixed") return `${price.currency} ${price.value}`;
    if (price.type === "hourly") return `${price.currency} ${price.value}/hr`;
    if (price.type === "negotiable")
      return `${price.currency} ${price.min} – ${price.max}`;
    return "Not disclosed";
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
    if (!window.confirm("Are you sure to delete this job?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/jobs/delete/${jobId}`, {
        withCredentials: true,
      });

      alert("Job deleted");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!job) return <p className="text-center mt-10">Job not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-5 bg-[#0F172A] rounded-2xl border border-white/10">
      
      {/* 👤 USER INFO */}
      <div className="flex items-center space-x-4 mb-4">
        {job.hirer?.profileImage ? (
          <img
            src={getImageUrl(job.hirer.profileImage)}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center">
            {job.hirer?.firstName?.[0]}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold">
            {job.hirer?.firstName} {job.hirer?.lastName}
          </h2>
          <p className="text-sm text-white/50">Job Poster</p>
        </div>
      </div>

      {/* 🧾 JOB DETAILS */}
      <h3 className="text-xl font-bold mb-2">{job.profession}</h3>

      <p className="text-white/70 mb-3">
        {job.description || "No description provided"}
      </p>

      <p className="text-yellow-400 font-semibold mb-2">
        Price: {formatPrice(job.price)}
      </p>

      {job.languages?.length > 0 && (
        <p className="text-white/60 mb-2">
          Languages: {job.languages.join(", ")}
        </p>
      )}

      {job.location?.address && (
        <p className="text-white/60 mb-4">
          Address: {job.location.address}
        </p>
      )}

      {/* 🔥 ACTION BUTTONS */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate(`/edit-job/${job._id}`)}
          className="bg-blue-500 px-4 py-2 rounded-xl"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 px-4 py-2 rounded-xl"
        >
          Delete
        </button>
      </div>
    </div>
  );
}