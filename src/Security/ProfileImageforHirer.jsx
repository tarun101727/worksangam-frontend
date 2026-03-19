import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProfileImageforHirer = () => {
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    navigate("/profile-preview/hirer", {
      state: { profileImage: url, file },
    });
  };

  const openCamera = () => {
    fileRef.current.setAttribute("capture", "environment");
    fileRef.current.click();
  };

  /* =======================
     MATCHED THEME STYLES
  ======================= */
  const buttonPrimary =
    "w-full py-3 rounded-xl font-semibold text-white " +
    "bg-[#6366F1] " +
    "shadow-lg shadow-[#6366F1]/30 " +
    "transition-all duration-300 " +
    "hover:bg-[#4F46E5] hover:shadow-xl hover:shadow-[#6366F1]/40 " +
    "active:scale-95";

  const buttonSecondary =
    "w-full py-3 rounded-xl font-semibold text-white " +
    "bg-[#111827] border border-white/10 " +
    "transition-all duration-300 " +
    "hover:bg-[#1F2937] hover:border-[#6366F1]/40 " +
    "hover:shadow-lg hover:shadow-[#6366F1]/20 " +
    "active:scale-95";

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 pt-6 sm:pt-0">
      <div
        className="
          w-full max-w-sm p-6 sm:p-8 rounded-3xl
          bg-transparent sm:bg-[#0F172A]/90
          backdrop-blur-0 sm:backdrop-blur-2xl
          border-0 sm:border sm:border-white/10
          shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]
          text-center transition-all duration-500
        "
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Add Profile Photo
        </h2>

        <p className="text-sm text-white/60 mb-8">
          Choose a photo from gallery or use your camera
        </p>

        <button
          onClick={() => fileRef.current.click()}
          className={`${buttonPrimary} mb-4`}
        >
          📁 Choose from Gallery
        </button>

        <button onClick={openCamera} className={buttonSecondary}>
          📷 Open Camera
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

export default ProfileImageforHirer;
