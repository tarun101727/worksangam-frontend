import { useNavigate } from "react-router-dom";

const GuestProfile = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="text-white space-y-6">

      {/* GUEST BADGE */}
      <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-xl">
        <p className="text-yellow-300 font-semibold">
          ⚠️ You are using a Guest Account
        </p>
        <p className="text-sm text-white/60 mt-1">
          Some features are restricted. Complete your profile to unlock everything.
        </p>
      </div>

      {/* BASIC INFO */}
      <div className="space-y-3">
        <p><b>Role:</b> Guest</p>
        <p><b>Status:</b> Limited Access</p>
        <p><b>Experience:</b> —</p>
        <p><b>Skills:</b> —</p>
      </div>

      {/* LOCKED FEATURES */}
      <div className="bg-[#0F172A]/80 p-4 rounded-xl">
        <h3 className="font-semibold mb-3">🔒 Locked Features</h3>

        <ul className="space-y-2 text-white/60">
          <li>• Chat with users</li>
          <li>• Apply for jobs</li>
          <li>• Post jobs</li>
          <li>• Rating & reviews</li>
        </ul>
      </div>

      {/* BENEFITS */}
      <div className="bg-indigo-500/10 p-4 rounded-xl">
        <h3 className="font-semibold mb-2">Why create account?</h3>

        <ul className="text-sm text-white/70 space-y-1">
          <li>✔ Get hired faster</li>
          <li>✔ Chat with hirers</li>
          <li>✔ Earn money</li>
          <li>✔ Build your profile</li>
        </ul>
      </div>

      {/* CTA BUTTON */}
      <button
        onClick={() => navigate("/signup")}
        className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 font-semibold"
      >
        🚀 Complete Profile
      </button>

    </div>
  );
};

export default GuestProfile;