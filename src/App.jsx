import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import SignupOptions from "./Security/SignupOptions";
import SignupEmail from "./Security/SignupEmail";
import SignupRole from "./Security/SignupRole";
import HirerSignup from "./Security/HirerSignup";
import EmployeeSignup from "./Security/EmployeeSignup";

import Login from "./Security/Login";
import Home from "./Home";
import ForgotPassword from "./Security/ForgotPassword";
import AdminSignup from "./Security/AdminSignup";
import AdminLogin from "./Security/AdminLogin";

import ProfileImageforHirer from "./Security/ProfileImageforHirer";
import ProfilePreviewforhirer from "./Security/ProfilePreviewforhirer";
import ProfileImageforEmployee from "./Security/ProfileImageforEmployee";
import ProfilePreviewforEmployee from "./Security/ProfilePreviewforEmployee";
import Profile from "./PROFILE/Profile";
import { socket } from "./utils/socket";

import { BASE_URL } from "./config";
import AdminUsers from "./AdminUsers";
import AdminDashboard from "./AdminDashboard";
import AdminAnalytics from "./AdminAnalytics";
import AdminReports from "./AdminReports";
import AdminJobs from "./AdminJobs";
import AdminLogs from "./AdminLogs";
import JobApplicationDetails from "./JobApplicationDetails";
import Chats from "./Chats";
import ChatPage from "./ChatPage";
import ChatMediaEditor from "./ChatMediaEditor";
import AccountSettings from "./Settings/AccountSettings";
import Settings from "./Settings/Settings";
import ProfileImageforHirerEdit from "./Settings/ProfileImageforHirerEdit";
import ProfilePreviewforhirerEdit from "./Settings/ProfilePreviewforhirerEdit";
import HirerAccountEdit from "./Settings/HirerAccountEdit";
import SecurityHirer from "./Settings/SecurityHirer";
import HirerEmailChanging from "./Settings/HirerEmailChanging";
import HirerPasswordChanging from "./Settings/HirerPasswordChanging";
import HirerDelete from "./Settings/HirerDelete";
import Logout from "./Settings/Logout";
import EmployeeAccountEdit from "./Settings/EmployeeAccountEdit";
import ProfilePreviewforEmployeeEdit from "./Settings/ProfilePreviewforEmployeeEdit";
import ProfileImageforEmployeeEdit from "./Settings/ProfileImageforEmployeeEdit";
import HirerOfflinePost from "./PROFILE/HirerOfflinePost";
import HirerOnlinePost from "./PROFILE/HirerOnlinePost";
import OnlineJobDetails from "./JobPost/OnlineJobDetails";
import OfflineJobDetails from "./JobPost/OfflineJobDetails";
import HirerOfflineUrgentPost from "./HirerOfflineUrgentPost";
import HirerOfflineUrgentMatches from "./HirerOfflineUrgentMatches";

import UrgentPreview from "./UrgentPreview";
import HirerOnlineUrgentPost from "./PROFILE/HirerOnlineUrgentPost";
import OnlineWorkerUrgentPosts from "./OnlineWorkerUrgentPosts";
import BuyCredits from "./BuyCredits";
import { urlBase64ToUint8Array } from "./utils/push";
import JobDetails from "./JobPost/JobDetails";
import EditJob from "./JobPost/EditJob";
import LanguageSelect from "./LanguageSelect";
import { useTranslation } from "react-i18next";
import HeaderLanguageSelect from "./HeaderLanguageSelect";
import CreditPlans from "./CreditPlans";




const getImageUrl = (img) => {
  if (!img) return "";

  // Cloudinary or external URL
  if (img.startsWith("http")) return img;

  // Local image fallback
  return `${BASE_URL}${img}`;
};

export default function App() {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]); // job notifications
const [chatNotifications, setChatNotifications] = useState([]); // chat notifications
  const { t } = useTranslation();


// Combined unread count for the bell
const unreadCount =
  notifications.filter(n => !n.isRead).length +
  chatNotifications.filter(n => !n.isRead).length;

  // Fetch job notifications from backend
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchJobNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/jobs/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data.notifications || []); // <- populate job notifications
    } catch (err) {
      console.error("Failed to fetch job notifications", err);
    }
  };

  fetchJobNotifications();
}, [isAuthenticated]);

 // Fetch existing notifications
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchChatNotifications = async () => {
  const res = await fetch(`${BASE_URL}/api/chat/notifications`, {
    credentials: "include",
  });
  const data = await res.json();

  // Normalize: add type: 'chat' and ensure message exists
  const normalized = (data.notifications || []).map(n => ({
    ...n,
    type: "chat",
    message: n.message || n.lastMessage || "", // use correct field from backend
  }));

  setChatNotifications(normalized);
};
  fetchChatNotifications();
}, [isAuthenticated]);

  const removeNotification = (postId) => {
    setNotifications((prev) =>
      prev.filter((n) => n.postId !== postId)
    );
  };

  const params = new URLSearchParams(location.search);
  const isSwitchMode = params.get("mode") === "switch";

  /* 🚫 ROUTES WHERE HEADER SHOULD NOT APPEAR */
  const hideHeaderOnRoutes = [
    "/signup/employee",
    "/signup",
    "/signup/role",
    "/signup/Email",
    "/profile-image/employee",
    "/profile-preview/employee",
    "/signup/hirer",
    "/profile-image/hirer",
    "/profile-preview/hirer",
    "/admin-signup",
    "/forgot-password",
    "/login",
    "/Offline/create-post",
    "/Online/create-post",
    "/chat",
    "/chat-media-editor",
    "/settings/Email",
    "/settings/Password",
    "/settings/account",
    "/settings/logout",
    "/settings/delete",
    "/settings",
    "/onlinejob/",
    "/offlinejob/",
    "/urgent-matches/",
    "/Hirer/Urgent",
    "/hirer-online-urgent-post",
    "/online-worker-urgent-posts",
    "/profile-preview/Employee-edit",
    "/select-language"
  ];

  const shouldHideHeader = hideHeaderOnRoutes.some((route) =>
  location.pathname.startsWith(route)
);

  /* 🔥 RESUME SIGNUP REDIRECT */
  useEffect(() => {
    if (!loading && isAuthenticated && user?.isGuest) {
      if (
        user.onboardingStep === "employee_profile" &&
        ![
          "/signup/employee",
          "/profile-image/employee",
          "/profile-preview/employee",
        ].includes(location.pathname)
      ) {
        navigate("/signup/employee", { replace: true });
      }

      if (
        user.onboardingStep === "hirer_profile" &&
        ![
          "/signup/hirer",
          "/profile-image/hirer",
          "/profile-preview/hirer",
        ].includes(location.pathname)
      ) {
        navigate("/signup/hirer", { replace: true });
      }
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  /* 🔔 SOCKET LISTENERS */
  useEffect(() => {
    socket.on("new-notification", (notification) => {
  setNotifications((prev) => [notification, ...prev]);

  if (Notification.permission === "granted") {
    new Notification("New Job Application", {
      body: `${notification.sender.firstName} applied for your job`,
    });
  }
});

    socket.on("job-taken", ({ postId }) => {
      removeNotification(postId);
      alert("Another employee accepted this job");
    });

    socket.on("job-expired", ({ postId }) => {
      removeNotification(postId);
    });

    return () => {
      socket.off("new-notification");
      socket.off("job-taken");
      socket.off("job-expired");
    };
  }, []);

  // Socket listener
useEffect(() => {
  socket.on("new-chat-notification", (notif) => {
  const normalized = { ...notif, type: "chat", message: notif.message || "" };
  setChatNotifications(prev => [normalized, ...prev]);

  if (Notification.permission === "granted") {
    new Notification("New Message", {
      body: `${notif.sender.firstName || "Unknown"} sent you a message`,
      icon: `${BASE_URL}${notif.sender.profileImage}`,
    });
  }
});
  return () => socket.off("new-chat-notification");
}, []);

  useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => console.log("SW registered", reg))
      .catch((err) => console.log("SW error", err));
  }
}, []);

useEffect(() => {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
      }).catch(err => console.error("Notification permission error:", err));
    }
  }
}, []);

const subscribeUser = async () => {
  if (Notification.permission !== "granted") {
    console.log("Push subscription skipped: permission not granted");
    return; // DO NOT SUBSCRIBE if denied or default
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    // 1️⃣ Fetch public key from backend
    const res = await fetch(`${BASE_URL}/api/push/public-key`);
    const { publicKey } = await res.json();

    // 2️⃣ Subscribe using fetched key
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // 3️⃣ Send subscription to backend
    await fetch(`${BASE_URL}/api/push/subscribe`, {
      method: "POST",
      body: JSON.stringify(sub),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Push subscription failed:", err);
  }
};

useEffect(() => {
  if (isAuthenticated) {
    subscribeUser();
  }
}, [isAuthenticated]);

const openNotifications = async () => {
  setShowNotifications(!showNotifications);

  if (!showNotifications) {
    try {
      await fetch(`${BASE_URL}/api/jobs/notifications/read`, { method: "PUT", credentials: "include" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      await fetch(`${BASE_URL}/api/chat/notifications/read`, { method: "PUT", credentials: "include" });
      setChatNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  }
};

 if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

  /* 🧠 ALLOW VALID ONBOARDING ROUTES */
  const isOnCorrectOnboardingRoute =
    (user?.onboardingStep === "employee_profile" &&
      [
        "/signup/employee",
        "/profile-image/employee",
        "/profile-preview/employee",
      ].includes(location.pathname)) ||
    (user?.onboardingStep === "hirer_profile" &&
      [
        "/signup/hirer",
        "/profile-image/hirer",
        "/profile-preview/hirer",
      ].includes(location.pathname));

  if (
    isAuthenticated &&
    user?.isGuest &&
    user.onboardingStep !== "completed" &&
    !isOnCorrectOnboardingRoute
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Resuming signup...
      </div>
    );
  }

  return (
    <div className="fixed h-screen w-full overflow-y-auto bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617]
 overflow-x-hidden z-10 text-white ">

      {/* 🔝 HEADER */}
      {!shouldHideHeader && (
        <div className="sticky top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">

            {/* Logo */}
            <h1
              className="text-2xl font-serif cursor-pointer"
              onClick={() => navigate("/home")}
            >
              {t("WORKSANGAM")}
            </h1>

           <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-7 xl:gap-8 relative">

            <HeaderLanguageSelect /> 

            <div
onClick={() => navigate("/chats")}
className="cursor-pointer"
>

<svg
xmlns="http://www.w3.org/2000/svg"
className="w-5 h-5 sm:w-7 sm:h-7"
fill="none"
viewBox="0 0 24 24"
stroke="currentColor"
>

<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03
8-9 8a9.863 9.863 0 01-4-.8L3
20l1.8-3.6A7.963 7.963 0 013
12c0-4.418 4.03-8 9-8s9 3.582
9 8z"
/>

</svg>

</div>

  <div
  className="relative cursor-pointer"
  onClick={openNotifications}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 sm:w-8 sm:h-8 text-white hover:text-yellow-400 transition"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11
         a6.002 6.002 0 00-4-5.659V5
         a2 2 0 10-4 0v.341C7.67 6.165
         6 8.388 6 11v3.159
         c0 .538-.214 1.055-.595 1.436L4 17h5
         m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>

  {unreadCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] sm:text-xs px-1.5 sm:px-2 py-[1px] rounded-full font-semibold">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</div>

{showNotifications && (
  <div className="absolute right-0 top-12 w-80 bg-[#0F172A] border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto scrollbar-dark z-50">
    {[...notifications, ...chatNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest first
      .map((n) => (
        <div
          key={n._id}
          onClick={() => {
            if (n.type === "chat") {
              navigate(`/chat/${n.chat}`);
            } else {
              navigate(`/job-application/${n._id}`);
            }
            setShowNotifications(false);
          }}
          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer"
        >
          {n.sender?.profileImage ? (
            <img
              src={getImageUrl(n.sender.profileImage)}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: n.sender?.avatarColor }}
            >
              {n.sender?.avatarInitial}
            </div>
          )}

          <p className="text-sm text-white">
            {n.type === "chat" && (
              <><b>{n.sender?.firstName} {n.sender?.lastName}</b>: {n.message?.slice(0, 30)}...</>
            )}
            {n.type === "job_application" && (
              <><b>{n.sender?.firstName} {n.sender?.lastName}</b> applied for your job</>
            )}
            {n.type === "application_accepted" && (
              <>Your application was <span className="text-green-400">accepted</span> by <b>{n.sender?.firstName} {n.sender?.lastName}</b></>
            )}
            {n.type === "application_rejected" && (
              <>Your application was <span className="text-red-400">rejected</span> by <b>{n.sender?.firstName} {n.sender?.lastName}</b></>
            )}
          </p>
        </div>
      ))}

          {/* Fallback if no notifications */}
    {[...notifications, ...chatNotifications].length === 0 && (
      <div className="p-4 text-center text-white/60">
        {t("No notifications")}
      </div>
    )}
  </div>
)}

  {/* Profile */}
{user && (
  <div
    onClick={() => navigate(`/profile/${user._id}`)}
    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
  >
    {user.profileImage ? (
      <img
        src={getImageUrl(user.profileImage)}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          backgroundColor:
            user.professionType === "guest"
              ? "#9CA3AF" // ✅ gray perfect circle
              : user.avatarColor || "#6B7280",
        }}
      >
        <span className="text-white font-bold text-sm">
          {user.avatarInitial || "G"}
        </span>
      </div>
    )}
  </div>
)}
</div>
          </div>
        </div>
      )}

      {/* ROUTES */}
      {/* ROUTES */}
<div>
      <Routes>
        <Route path="/select-language" element={
            isAuthenticated && user?.isGuest === false && !isSwitchMode
              ? <Navigate to="/home" replace />
              : <LanguageSelect />
          }/>

        <Route
          path="/signup"
          element={
            isAuthenticated && user?.isGuest === false && !isSwitchMode
              ? <Navigate to="/home" replace />
              : <SignupOptions />
          }
        />

        <Route path="/signup/email" element={<SignupEmail />} />
        <Route path="/signup/role" element={<SignupRole />} />
        <Route path="/signup/hirer" element={<HirerSignup />} />
        <Route path="/signup/employee" element={<EmployeeSignup />} />

        <Route
  path="/home"
  element={
    isAuthenticated
      ? <Home />
      : <Navigate to="/signup" replace />
  }
/>

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/admin-signup"
          element={
            isAuthenticated && user?.isGuest === false && !isSwitchMode
              ? <Navigate to="/home" replace />
              : <AdminSignup />
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/profile-image/hirer" element={<ProfileImageforHirer />} />
        <Route path="/profile-preview/hirer" element={<ProfilePreviewforhirer />} />
        <Route path="/profile-image/employee" element={<ProfileImageforEmployee />} />
        <Route path="/profile-preview/employee" element={<ProfilePreviewforEmployee />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Offline/create-post" element={<HirerOfflinePost/>}/>
        <Route path="/Online/create-post" element={<HirerOnlinePost/>}/>

        <Route path="/profile/:userId" element={<Profile />} />

        <Route
  path="/admin/dashboard"
  element={
    isAuthenticated && ["admin", "owner"].includes(user?.role)
      ? <AdminDashboard />
      : <Navigate to="/login" replace />
  }
/>

<Route
  path="/admin/users"
  element={
    isAuthenticated && ["admin", "owner"].includes(user?.role)
      ? <AdminUsers />
      : <Navigate to="/login" replace />
  }
/>
      <Route path="/admin/logs" element={<AdminLogs />} />
      <Route path="/admin/jobs" element={<AdminJobs />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      

<Route path="/onlinejob/:jobId" element={<OnlineJobDetails/>}/>
<Route path="/offlinejob/:jobId" element={<OfflineJobDetails/>}/>
<Route
  path="/job-application/:notificationId"
  element={<JobApplicationDetails />}
/>
<Route path="/chats" element={<Chats />} />
<Route path="/chat/:chatId" element={<ChatPage />} />
<Route path="/chat-media-editor" element={<ChatMediaEditor />} />
<Route path="/settings" element={<Settings/>}/>
<Route path="/settings/account" element={<AccountSettings/>}/>
<Route path="/profile-image/hirer-edit" element={<ProfileImageforHirerEdit/>}/>
<Route
path="/profile-preview/hirer-edit"
element={<ProfilePreviewforhirerEdit/>}
/>
<Route path="/profile-image/employee-edit" element={<ProfileImageforEmployeeEdit/>}/>
<Route path="/profile-preview/Employee-edit" element={<ProfilePreviewforEmployeeEdit/>}/>
<Route
  path="/settings/hirer/account"
  element={<HirerAccountEdit user={user}/>}
/>
<Route path="/settings/security" element={<SecurityHirer/>}/>
<Route path="/settings/Email" element={<HirerEmailChanging/>}/>
<Route path="/settings/Password" element={<HirerPasswordChanging/>}/>
<Route path="/settings/delete" element={<HirerDelete />} />
<Route path="/settings/logout" element={<Logout/>}/>
<Route
  path="/settings/Employee"
  element={<EmployeeAccountEdit user={user}/>}
/>

<Route path="/Hirer/Urgent" element={<HirerOfflineUrgentPost/>}/>
<Route path="/urgent-matches/:postId" element={<HirerOfflineUrgentMatches />} />

<Route path="/hirer/urgent-preview/:postId" element={<UrgentPreview />} />

 {/* Hirer creates online urgent post */}
      <Route
        path="/hirer-online-urgent-post"
        element={<HirerOnlineUrgentPost />}
      />

      {/* Display online workers for profession */}
      <Route
        path="/online-worker-urgent-posts"
        element={<OnlineWorkerUrgentPosts />}
      />
      <Route path="/job/:jobId" element={<JobDetails />} />
      <Route path="/edit-job/:jobId" element={<EditJob />} />
   <Route path="/buy-credits" element={<BuyCredits/>}/>
  <Route path="/payment-success" element={<CreditPlans />} />
        <Route path="*" element={<Navigate to="/select-language" replace />} />
      </Routes>
      </div>
    </div>
  );
}
