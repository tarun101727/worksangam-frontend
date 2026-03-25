import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ✅ GET AUTH CONTEXT
  const { setIsAuthenticated, setUser } = useContext(AuthContext);

  const logoutUser = async () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      alert("Logged out successfully");

      // 🔥 IMPORTANT: CLEAR FRONTEND AUTH STATE
      setIsAuthenticated(false);
      setUser(null);

      // ✅ REDIRECT TO SIGNUP OPTIONS
      navigate("/signup", { replace: true });

    } catch (err) {
      alert(err?.response?.data?.msg || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-yellow-400">
        Logout
      </h1>

      <p className="text-gray-300 mb-6">
        Logging out will end your current session on this device.
        You will need to sign in again to access your account,
        manage your profile, post jobs, hire employees, or update your settings.
      </p>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-2">
          What happens when you logout?
        </h2>

        <ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">
          <li>Your session will be closed.</li>
          <li>You will be signed out from this device.</li>
          <li>Your account and data will remain safe.</li>
          <li>You can log in again anytime.</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={logoutUser}
          disabled={loading}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 p-3 rounded-xl font-semibold"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="flex-1 bg-[#111827] border border-white/10 p-3 rounded-xl"
        >
          More
        </button>
      </div>
    </div>
  );
}
