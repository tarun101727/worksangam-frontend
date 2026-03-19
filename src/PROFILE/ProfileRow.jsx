const ProfileRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 break-words">
    {/* LABEL / TITLE */}
    <p className="text-xs uppercase tracking-wider text-white/40 font-medium">
      {label}
    </p>

    {/* VALUE / ANSWER */}
    <p className="text-base font-semibold text-white break-words">
      {value || "—"}
    </p>
  </div>
);

export default ProfileRow;