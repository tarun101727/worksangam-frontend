import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import { useParams } from "react-router-dom";

export default function HirerApplications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/jobs/${jobId}`, {
        withCredentials: true,
      })
      .then((res) => setJob(res.data.job));
  }, [jobId]);

  const respond = async (employeeId, action) => {
    await axios.post(
      `${BASE_URL}/api/jobs/respond/${jobId}/${employeeId}`,
      { action },
      { withCredentials: true }
    );

    window.location.reload();
  };

  if (!job) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-xl font-bold">{job.profession} Applications</h2>

      {job.applications.map((app) => (
        <div
          key={app._id}
          className="p-4 bg-[#0F172A] rounded-xl"
        >
          <p>{app.employee.firstName} {app.employee.lastName}</p>
          <p>Distance: {Math.round(app.distance)} meters</p>

          <div className="flex gap-4 mt-3">
            <button
              onClick={() => respond(app.employee._id, "accepted")}
              className="bg-green-500 px-4 py-2 rounded-xl"
            >
              Accept
            </button>

            <button
              onClick={() => respond(app.employee._id, "rejected")}
              className="bg-red-500 px-4 py-2 rounded-xl"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}