// src/Admin/AdminDashboard.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "./config";

const StatCard = ({ label, value }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
    <p className="text-sm text-white/50">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/admin/stats`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">🧠 Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Employees" value={stats.totalEmployees} />
        <StatCard label="Total Hirers" value={stats.totalHirers} />
        <StatCard label="Active Employees (LIVE)" value={stats.liveEmployees} />
        <StatCard label="Total Job Posts" value={stats.totalJobPosts} />
        <StatCard label="Jobs Filled Today" value={stats.jobsFilledToday} />
      </div>
    </div>
  );
};

export default AdminDashboard;
