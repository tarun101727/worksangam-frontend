import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config";

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = () => {
    axios
      .get(`${BASE_URL}/api/auth/admin/jobs`, {
        withCredentials: true,
      })
      .then((res) => setJobs(res.data.jobs))
      .catch(console.error);
  };

  useEffect(fetchJobs, []);

  const approveJob = (id) =>
    axios
      .patch(
        `${BASE_URL}/api/auth/admin/jobs/${id}/approve`,
        {},
        { withCredentials: true }
      )
      .then(fetchJobs);

  const rejectJob = (id) =>
    axios
      .patch(
        `${BASE_URL}/api/auth/admin/jobs/${id}/reject`,
        {},
        { withCredentials: true }
      )
      .then(fetchJobs);

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📌 Job Moderation</h1>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <p className="font-semibold">{job.profession}</p>
            <p className="text-sm text-gray-400">
              Status: {job.status}
            </p>
            <p className="text-xs text-gray-500">
              Hirer: {job.hirer?.email || "N/A"}
            </p>

            <div className="flex gap-2 mt-3">
              {job.status === "pending" && (
                <>
                  <button
                    onClick={() => approveJob(job._id)}
                    className="px-3 py-1 bg-green-600 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectJob(job._id)}
                    className="px-3 py-1 bg-red-600 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminJobs;
