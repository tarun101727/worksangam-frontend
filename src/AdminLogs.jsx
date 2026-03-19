import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/admin/logs`, { withCredentials: true })
      .then((res) => setLogs(res.data.logs))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📜 Admin Activity Logs</h1>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log._id}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="font-semibold">{log.action}</p>
            <p className="text-sm text-gray-400">
              Target: {log.targetType} | {log.targetId}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLogs;
