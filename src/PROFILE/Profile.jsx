import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useAuth } from "../useAuth";
import { useParams, useNavigate } from "react-router-dom";

import EmployeeProfile from "./EmployeeProfile";
import HirerProfile from "./HirerProfile";
import AdminProfile from "../AdminProfile";
import GuestProfile from "./GuestProfile";
import { useTranslation } from "react-i18next";


const Profile = () => {
  const { user: loggedInUser, setUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(false);
  const { t } = useTranslation();

  const isOwnProfile = !userId || userId === loggedInUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        let res;

        if (isOwnProfile) {
          res = await axios.get(
            `${BASE_URL}/api/auth/get-current-user`,
            { withCredentials: true }
          );

          setUser(res.data.user);
          setProfileUser(res.data.user);
        } else {
          res = await axios.get(
            `${BASE_URL}/api/users/profile/${userId}`,
            { withCredentials: true }
          );

          setProfileUser(res.data.user);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]); // ✅ fixed dependency

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex sm:items-center sm:justify-center pt-6 text-white/70">
        {t("Loading profile...")}
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex sm:items-center sm:justify-center pt-6 text-red-400">
        {error || t("User not found")}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
<div
  className="
    max-w-3xl mx-auto
    p-4 sm:p-8
    rounded-none sm:rounded-3xl
    sm:bg-[#0F172A]/90
    sm:border sm:border-white/10
  "
>

        {/* ---------------- HEADER ---------------- */}

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          
              {/* Right: Chat Button (only visible to hirers viewing an employee) */}
  {loggedInUser?.role === "hirer" &&
    profileUser.role === "employee" &&
    !isOwnProfile && (
      <button
        onClick={async (e) => {
          e.stopPropagation(); // Prevent navigating to profile when clicking chat
          try {
            const res = await axios.post(
              `${BASE_URL}/api/chat/create/${profileUser._id}`,
              {},
              { withCredentials: true }
            );
            navigate(`/chat/${res.data._id}`);
          } catch (err) {
            console.error(err);
          }
        }}
        className="absolute top-0 right-0 
                 px-6 py-3            /* larger padding */
                 text-lg               /* larger text */
                 rounded-2xl           /* slightly more rounded */
                 bg-green-500 text-white 
                 hover:bg-green-600 
                 transition-all"
      >
        {t("chat_with_user", { name : profileUser.firstName })}
      </button>
  )}

          {/* SETTINGS BUTTON */}
          {isOwnProfile && !profileUser.isGuest && (
            <button
              onClick={() => navigate("/settings")}
              className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white opacity-80 hover:opacity-100 cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>

                <path d="M19.4 15
                a1.65 1.65 0 0 0 .33 1.82
                l.06.06
                a2 2 0 1 1-2.83 2.83
                l-.06-.06
                a1.65 1.65 0 0 0-1.82-.33
                1.65 1.65 0 0 0-1 1.51
                V21
                a2 2 0 1 1-4 0
                v-.09
                a1.65 1.65 0 0 0-1-1.51
                1.65 1.65 0 0 0-1.82.33
                l-.06.06
                a2 2 0 1 1-2.83-2.83
                l.06-.06
                a1.65 1.65 0 0 0 .33-1.82
                1.65 1.65 0 0 0-1.51-1H3
                a2 2 0 1 1 0-4
                h.09
                a1.65 1.65 0 0 0 1.51-1
                1.65 1.65 0 0 0-.33-1.82
                l-.06-.06
                a2 2 0 1 1 2.83-2.83
                l.06.06
                a1.65 1.65 0 0 0 1.82.33
                a1.65 1.65 0 0 0 1-1.51
                V3
                a2 2 0 1 1 4 0
                v.09
                a1.65 1.65 0 0 0 1 1.51
                1.65 1.65 0 0 0 1.82-.33
                l.06-.06
                a2 2 0 1 1 2.83 2.83
                l-.06.06
                a1.65 1.65 0 0 0-.33 1.82
                a1.65 1.65 0 0 0 1.51 1
                H21
                a2 2 0 1 1 0 4
                h-.09
                a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </button>
          )}

          {/* PROFILE IMAGE */}
          {profileUser.profileImage ? (
            <img
              src={
  profileUser.profileImage?.startsWith("http")
    ? profileUser.profileImage
    : `${BASE_URL}${profileUser.profileImage}`
}
              alt="Profile"
              onClick={() => setShowImage(true)}
              className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center
              text-3xl font-bold text-white"
              style={{ background: profileUser.avatarColor }}
            >
              {profileUser.avatarInitial}
            </div>
          )}

          {/* NAME */}
          <div>
        
    <h2 className="text-3xl font-bold">
      {profileUser.firstName} {profileUser.lastName}
    </h2>
            
            {!profileUser.isGuest && (
            <p className="text-sm text-white/60 capitalize">
              {profileUser.role}
            </p>
            )}

            {!isOwnProfile && (
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-300">
                {t("Viewing profile")}
              </span>
            )}
          </div>

        </div>

        {/* RIGHT SIDE PANEL (ONLY LAPTOP) */}
{profileUser.isGuest && (
  <div className="hidden sm:block min-w-[220px] bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-xl">
    
    <p className="text-yellow-300 font-semibold text-sm">
      ⚠️ Guest Account
    </p>

    <p className="text-xs text-white/60 mt-1">
      Unlock all features by completing profile
    </p>

    <button
      onClick={() => navigate("/signup/role")}
      className="mt-3 w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold"
    >
      🚀 Complete Profile
    </button>
  </div>
)}

        {/* ---------------- ROLE BASED CONTENT ---------------- */}

{profileUser.isGuest && (
  <GuestProfile user={profileUser} />
)}

{!profileUser.isGuest && profileUser.role === "employee" && (
  <EmployeeProfile user={profileUser} readOnly={!isOwnProfile} />
)}

{!profileUser.isGuest && profileUser.role === "hirer" && (
  <HirerProfile user={profileUser} />
)}

{!profileUser.isGuest && ["admin", "owner"].includes(profileUser.role) && (
  <AdminProfile user={profileUser} />
)}

      </div>

      {/* ---------------- IMAGE MODAL ---------------- */}

      {showImage && profileUser.profileImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowImage(false)}
        >
          <img
            src={
  profileUser.profileImage?.startsWith("http")
    ? profileUser.profileImage
    : `${BASE_URL}${profileUser.profileImage}`
}
            alt="Profile Enlarged"
            className="max-w-[90%] max-h-[90%] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute top-6 right-6 text-white text-3xl font-bold"
            onClick={() => setShowImage(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
