import ProfileRow from "./PROFILE/ProfileRow";
import { useNavigate } from "react-router-dom";

const AdminProfile = ({ user }) => {
  const navigate = useNavigate();

  const adminBtnClasses = `
    w-full flex items-center gap-3
    px-5 py-3 rounded-xl
    bg-slate-800/70
    text-left text-sm font-medium text-white
    border border-slate-700
    transition-all duration-200
    hover:bg-slate-700/80 hover:border-slate-500
    hover:translate-x-1
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    active:scale-[0.98]
  `;

  return (
    <div className="space-y-6 text-white">
      {/* BASIC INFO */}
      <ProfileRow
        label="Role"
        value={user?.role ? user.role.toUpperCase() : "—"}
      />
      <ProfileRow
        label="Email"
        value={user?.email || "—"}
      />

      {/* ADMIN SECTIONS */}
      <div className="pt-4 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className={adminBtnClasses}
        >
          🧠 Dashboard
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className={adminBtnClasses}
        >
          👥 Manage Users
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/jobs")}
          className={adminBtnClasses}
        >
          📌 Job Moderation
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/reports")}
          className={adminBtnClasses}
        >
          🚨 Reports & Moderation
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/logs")}
          className={adminBtnClasses}
        >
          📜 Activity Logs
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/analytics")}
          className={adminBtnClasses}
        >
          📊 Analytics
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
