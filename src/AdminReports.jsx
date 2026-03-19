import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config";

const AdminReports = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    axios
      .get(`${BASE_URL}/api/auth/admin/reports`, { withCredentials: true })
      .then((res) => setReports(res.data.reports));
  };

  useEffect(fetchReports, []);

  const resolveReport = (id) =>
    axios
      .patch(`${BASE_URL}/api/auth/admin/reports/${id}/resolve`, {}, { withCredentials: true })
      .then(fetchReports);

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">🚨 Reports</h1>

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r._id} className="p-4 bg-white/5 rounded-xl">
            <p className="font-semibold">{r.reason}</p>
            <p className="text-sm text-gray-400">Status: {r.status}</p>

            {r.status === "open" && (
              <button
                onClick={() => resolveReport(r._id)}
                className="mt-2 px-3 py-1 bg-purple-600 rounded"
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
