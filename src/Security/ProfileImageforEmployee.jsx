import React, { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";



const ProfileImageforEmployee = () => {
  const fileRef = useRef();
const navigate = useNavigate();
const location = useLocation();
  const { t } = useTranslation();

  const handleFile = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    navigate("/profile-preview/employee", {
  state: {
    profileImage: url,
    file,
    form: location.state?.form   // ✅ keep form data
  },
});
  };

  const openCamera = () => {
    fileRef.current.setAttribute("capture", "environment");
    fileRef.current.click();
  };

  /* =======================
     BUTTON STYLES
  ======================= */
  const buttonPrimary =
    "w-full py-2.5 md:py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95";

  const buttonSecondary =
    "w-full py-2.5 md:py-3 rounded-xl font-semibold text-white " +
    "bg-[#111827] border border-white/10 " +
    "transition-all duration-300 " +
    "hover:bg-[#1F2937] hover:border-[#6366F1]/40 " +
    "hover:shadow-lg hover:shadow-[#6366F1]/20 " +
    "active:scale-95";

  return (
    /* MOBILE + SPLIT SCREEN → TOP | DESKTOP → CENTER */
    <div className="min-h-screen flex items-start justify-center pt-6 md:items-center md:pt-0 px-4">
      <div
        className="
          w-full max-w-sm md:max-w-md
          p-4 sm:p-6 md:p-8
          text-center transition-all duration-300

          /* MOBILE & SPLIT SCREEN */
          bg-transparent shadow-none border-0 rounded-none backdrop-blur-0

          /* DESKTOP CARD */
          md:rounded-3xl
          md:bg-[#0F172A]/90 md:backdrop-blur-2xl
          md:border md:border-white/10
          md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
        "
      >
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          {t("Add Profile Photo")}
        </h2>

        <p className="text-sm md:text-base text-white/60 mb-8">
          {t("Choose a photo from your gallery or take one using your camera")}
        </p>

        <button
          onClick={() => fileRef.current.click()}
          className={`${buttonPrimary} mb-4`}
        >
          📁 {t("Choose from Gallery")}
        </button>

        <button onClick={openCamera} className={buttonSecondary}>
          📷 {t("Open Camera")}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
};

export default ProfileImageforEmployee;
