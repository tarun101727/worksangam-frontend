import { useNavigate } from "react-router-dom";

const GuestProfile = ({user}) => {
  const navigate = useNavigate();

  return (
    <div className="text-white space-y-6">

      {/* GUEST BADGE */}
      <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-xl">
        <p className="text-yellow-300 font-semibold">
          ⚠️ You are using a Guest Account
        </p>
        <p className="text-sm text-white/60 mt-1">
          Choose how you want to use Worksangam 👇
        </p>
      </div>

      {/* ROLE SELECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* EMPLOYEE CARD */}
        <div className="bg-[#0F172A]/80 p-5 rounded-xl border border-white/10 hover:border-green-400 transition">
          <h3 className="text-lg font-semibold mb-2">👷 Employee</h3>

          <ul className="text-sm text-white/60 space-y-1 mb-4">
            <li>✔ Find jobs nearby</li>
            <li>✔ Chat with hirers</li>
            <li>✔ Earn money</li>
            <li>✔ Build your profile</li>
          </ul>

          <button
            onClick={() => navigate("/signup/employee")}
            className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 font-semibold"
          >
            Continue as Employee
          </button>
        </div>

        {/* HIRER CARD */}
        <div className="bg-[#0F172A]/80 p-5 rounded-xl border border-white/10 hover:border-indigo-400 transition">
          <h3 className="text-lg font-semibold mb-2">🧑‍💼 Hirer</h3>

          <ul className="text-sm text-white/60 space-y-1 mb-4">
            <li>✔ Post jobs</li>
            <li>✔ Hire instantly</li>
            <li>✔ Chat with workers</li>
            <li>✔ Manage applications</li>
          </ul>

          <button
            onClick={() => navigate("/signup/hirer")}
            className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold"
          >
            Continue as Hirer
          </button>
        </div>

      </div>

      {/* LOCKED FEATURES */}
      <div className="bg-[#0F172A]/80 p-4 rounded-xl">
        <h3 className="font-semibold mb-3">🔒 Locked Features</h3>

        <ul className="space-y-2 text-white/60 text-sm">
          <li>• Chat with users</li>
          <li>• Apply / Post jobs</li>
          <li>• Rating & reviews</li>
          <li>• Real-time job notifications</li>
        </ul>
      </div>

      <button
  onClick={() => navigate("/login")}
  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-indigo-500 hover:opacity-90 font-semibold"
>
  🚀 Login to Continue
</button>

    </div>
  );
};

export default GuestProfile;
