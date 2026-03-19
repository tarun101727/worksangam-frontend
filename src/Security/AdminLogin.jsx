import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

const AdminLogin = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/admin/login`,
        form,
        { withCredentials: true }
      );

      // ✅ AUTH STATE
      setIsAuthenticated(true);
      setUser(res.data.admin);

      // ✅ REDIRECT
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      setError(err.response?.data?.msg || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed top-0 w-full h-screen grid place-items-center px-4 z-50 text-black"
    >
      <div className="bg-white/70 p-6 rounded-3xl shadow-xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h2>

        {error && (
          <p className="mb-4 text-red-600 text-center font-medium">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Admin Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
          className="w-full p-3 mb-4 border-2 rounded-xl"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full p-3 mb-6 border-2 rounded-xl"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full p-3 rounded-xl text-white font-semibold
                     bg-black hover:bg-gray-900 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>

        <p className="mt-4 text-center text-xs text-gray-600">
          🔒 Authorized administrators only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
