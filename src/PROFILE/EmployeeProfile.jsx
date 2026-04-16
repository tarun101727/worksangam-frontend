import { useTranslation } from "react-i18next";
import ProfileComments from "../ProfileComments";
import { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import ProfileRow from "./ProfileRow";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";
import { useAuth } from "../useAuth";



/* ⭐ STAR COMPONENT (memoized & fixed gradient bug) */
const Star = memo(({ index, value, setRating, setHover }) => {

  const handleClick = useCallback((e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const selected = x < width / 2 ? index - 0.5 : index;
    setRating(selected);
  }, [index, setRating]);

  const handleHover = useCallback((e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const hoverValue = x < width / 2 ? index - 0.5 : index;
    setHover(hoverValue);
  }, [index, setHover]);

  const filled = index <= value;
  const half = !filled && index - 0.5 === value;

  return (
    <svg
      onClick={handleClick}
      onMouseMove={handleHover}
      onMouseLeave={() => setHover(0)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-7 h-7 cursor-pointer"
      fill={filled ? "#FACC15" : half ? `url(#half-star-${index})` : "none"}
      stroke="#FACC15"
    >
      <defs>
        <linearGradient id={`half-star-${index}`}>
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.01 6.18
        6.497.047c.969.007 1.371 1.24.588
        1.81l-5.26 3.822 1.97
        6.21c.285.898-.755
        1.64-1.54 1.118L12
        18.347l-5.216 3.767c-.785.522-1.825-.22-1.54-1.118l1.97-6.21
        -5.26-3.822c-.783-.57-.38-1.803.588-1.81l6.497-.047
        2.01-6.18z"
      />
    </svg>
  );
});

const EmployeeProfile = ({ user, notification, clear, readOnly }) => {

  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const { t } = useTranslation();
  const [translated, setTranslated] = useState({
  profession: null,
  skills: null,
  bio: null,
});

const [loadingTranslate, setLoadingTranslate] = useState(null);

const currentLang = localStorage.getItem("lang") || "en";
const { user: loggedUser } = useAuth();


const handleTranslate = async (field, text) => {
  if (!text) return;

  try {
    setLoadingTranslate(field);

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${currentLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await res.json();

    const translatedText = data[0].map((item) => item[0]).join("");

    setTranslated((prev) => ({
      ...prev,
      [field]: translatedText,
    }));

  } catch (err) {
    console.error("Translation failed", err);
  } finally {
    setLoadingTranslate(null);
  }
};
  

  /* Join socket room */
  useEffect(() => {
    if (user?._id) {
      socket.emit("join-profile", user._id);
    }
  }, [user?._id]);

  /* Rating updates */
  useEffect(() => {

    const handleRatingUpdate = (data) => {
      if (data.employeeId === user?._id) {
        setAvgRating(data.ratingAverage);
      }
    };

    socket.on("employee-rating-updated", handleRatingUpdate);

    return () => {
      socket.off("employee-rating-updated", handleRatingUpdate);
    };

  }, [user?._id]);

  /* Availability updates */
  useEffect(() => {

    const handleAvailabilityChange = (data) => {
      if (data.employeeId === user?._id) {
        setIsAvailable(data.isAvailable);
      }
    };

    socket.on("employee-availability-changed", handleAvailabilityChange);

    return () => {
      socket.off("employee-availability-changed", handleAvailabilityChange);
    };

  }, [user?._id]);

  /* Sync availability */
  useEffect(() => {
    if (typeof user?.isAvailable === "boolean") {
      setIsAvailable(user.isAvailable);
    }
  }, [user?.isAvailable]);

  /* Load rating */
  useEffect(() => {

    if (!user?._id) return;

    const loadEmployee = async () => {
      try {

        const res = await axios.get(
          `${BASE_URL}/api/auth/employee/${user._id}`,
          { withCredentials: true }
        );

        setAvgRating(res.data.ratingAverage || 0);
        setMyRating(res.data.currentUserRating || 0);

      } catch (err) {
        console.error("Rating load failed", err);
      }
    };

    loadEmployee();

  }, [user?._id]);

  /* Toggle availability */
  const toggleAvailability = useCallback(async () => {

    if (loading) return;

    try {

      setLoading(true);

      if (!isAvailable) {

        if (!navigator.geolocation) {
          alert("Geolocation not supported");
          return;
        }

        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );

        await axios.post(
          `${BASE_URL}/api/auth/save-location`,
          {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          { withCredentials: true }
        );
      }

      const res = await axios.post(
        `${BASE_URL}/api/auth/toggle-availability`,
        {},
        { withCredentials: true }
      );

      setIsAvailable(res.data.isAvailable);

    } catch (err) {

      console.error(err);
      alert("Location permission required");

    } finally {
      setLoading(false);
    }

  }, [loading, isAvailable]);

  /* Accept job */
  const acceptJob = useCallback(async () => {

    try {

      await axios.post(
        `${BASE_URL}/api/hirer-post/accept/${notification.postId}`,
        {},
        { withCredentials: true }
      );

      clear?.();
      navigate(`/chat/${notification.hirer._id}`);

    } catch (err) {
      console.error("Accept job failed", err);
    }

  }, [notification, navigate, clear]);

  /* Submit rating */
  const submitRating = async () => {

    try {

      const res = await axios.post(
        `${BASE_URL}/api/auth/rate-employee`,
        { employeeId: user._id, rating },
        { withCredentials: true }
      );

      setAvgRating(res.data.ratingAverage);
      setMyRating(rating);
      setRating(0);

    } catch (err) {
      console.error("Rating failed", err);
    }

  };

  const starValue = hover || rating || myRating;

  return (
    <>
      {/* STATUS */}
      <div className="flex items-center justify-between mb-6 text-white">
        <p>
          Status:
          <span
            className={`ml-2 font-bold ${
              isAvailable ? "text-green-400" : "text-red-400"
            }`}
          >
            {isAvailable ? t("LIVE") : t("OFFLINE")}
          </span>
        </p>

        {!readOnly && (
          <button
            disabled={loading}
            onClick={toggleAvailability}
            className={`px-5 py-2 rounded-xl font-semibold ${
              isAvailable
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {loading ? t("Please wait...") : isAvailable ? t("Go Offline") : t("Go Live")}
          </button>
        )}
      </div>

      {/* USER RATING */}
      {readOnly && (
        <div className="mt-8 text-white">

          <p className="text-white/60 mb-2">{t("Your Rating")}</p>

          <div className="flex gap-1">
            {[1,2,3,4,5].map((star) => (
              <Star
                key={star}
                index={star}
                value={starValue}
                setRating={setRating}
                setHover={setHover}
              />
            ))}
          </div>

          {rating > 0 && (
            <button
              onClick={submitRating}
              className="mt-3 px-4 py-2 bg-indigo-500 rounded-lg"
            >
              {t("Submit")}
            </button>
          )}

        </div>
      )}

      {/* AVERAGE RATING */}
      <div className="mt-6 flex items-center gap-2 text-yellow-400">
        <span className="font-semibold">
          {(avgRating ?? 0).toFixed(1)} / 5
        </span>
      </div>
      {/* PROFILE INFO */}
      <div className="space-y-4 text-white mt-6">
        <ProfileRow label={t("Age")} value={user?.age ?? "—"} />
        <ProfileRow label={t("Gender")} value={user?.gender ?? "—"} />

        <div>
  <ProfileRow
    label={t("Profession")}
    value={translated.profession || user?.profession || "—"}
  />

  {readOnly && user?.profession && (
    <button
      onClick={() => handleTranslate("profession", user.profession)}
      className="text-sm text-indigo-400"
    >
      {loadingTranslate === "profession" ? "..." : t("Translate")}
    </button>
  )}
</div>

<div>
  <ProfileRow
    label={t("Skills")}
    value={translated.skills || user?.skills || "—"}
  />

  {readOnly && user?.skills && (
    <button
      onClick={() => handleTranslate("skills", user.skills)}
      className="text-sm text-indigo-400"
    >
      {loadingTranslate === "skills" ? "..." : t("Translate")}
    </button>
  )}
</div>

<div>
  <ProfileRow
    label={t("Description")}
    value={translated.bio || user?.bio || "—"}
  />

  {readOnly && user?.bio && (
    <button
      onClick={() => handleTranslate("bio", user.bio)}
      className="text-sm text-indigo-400"
    >
      {loadingTranslate === "bio" ? "..." : t("Translate")}
    </button>
  )}
</div>


        <ProfileRow
          label={t("Experience")}
          value={user?.experience ? `${user.experience} years` : "—"}
        />
        <ProfileRow
  label={t("Languages")}
  value={user?.languages?.length ? user.languages.join(", ") : "—"}
/>
      </div>

      {/* JOB NOTIFICATION */}
      {notification && isAvailable && (

        <div className="fixed bottom-6 right-6 w-80 p-5 bg-[#0F172A]/90 rounded-2xl text-white">

          <p className="font-bold text-lg">
            {notification.profession} needed
          </p>

          <p className="text-sm text-white/70">
            {notification.hirer.firstName} {notification.hirer.lastName}
          </p>

          <p className="mt-3 text-sm">{notification.description}</p>

          <p className="mt-3 font-semibold">
            ₹ {notification.price}
          </p>

          <div className="flex gap-3 mt-5">

            <button
              onClick={acceptJob}
              className="flex-1 bg-indigo-500 py-2 rounded-xl"
            >
              {t("Accept")}
            </button>

            <button
              onClick={clear}
              className="flex-1 bg-gray-800 py-2 rounded-xl"
            >
              {t("Deny")}
            </button>

          </div>

        </div>

      )}
     {/* COMMENTS */}
<div className="mt-12">
  <ProfileComments 
  profileId={user?._id} 
  loggedInUserId={loggedUser?._id} 
/>
</div>
     
    </>
  );
};

export default EmployeeProfile;
