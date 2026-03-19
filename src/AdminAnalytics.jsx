import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config";

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/admin/stats`, { withCredentials: true })
      .then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-white p-8">Loading…</p>;

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">📊 Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="p-6 bg-white/5 rounded-xl">
            <p className="text-sm text-gray-400">{k}</p>
            <p className="text-3xl font-bold">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAnalytics;
