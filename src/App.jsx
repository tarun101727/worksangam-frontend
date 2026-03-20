import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import Home from "./Home";

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

export default function App() {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatNotifications, setChatNotifications] = useState([]);

  const unreadCount =
    notifications.filter(n => !n.isRead).length +
    chatNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchJobNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/jobs/notifications`, {
          credentials: "include",
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Failed to fetch job notifications", err);
      }
    };

    fetchJobNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchChatNotifications = async () => {
      const res = await fetch(`${BASE_URL}/api/chat/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      const normalized = (data.notifications || []).map(n => ({
        ...n,
        type: "chat",
        message: n.message || n.lastMessage || "",
      }));
      setChatNotifications(normalized);
    };
    fetchChatNotifications();
  }, [isAuthenticated]);

  const removeNotification = (postId) => {
    setNotifications(prev => prev.filter(n => n.postId !== postId));
  };

  /* 🚫 ROUTES WHERE HEADER SHOULD NOT APPEAR */
  const hideHeaderOnRoutes = [
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
    "/online-worker-urgent-posts"
  ];

  const shouldHideHeader = hideHeaderOnRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  /* 🔔 SOCKET LISTENERS */
  useEffect(() => {
    socket.on("new-notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
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

  useEffect(() => {
    socket.on("new-chat-notification", (notif) => {
      const normalized = { ...notif, type: "chat", message: notif.message || "" };
      setChatNotifications(prev => [normalized, ...prev]);
      if (Notification.permission === "granted") {
        new Notification("New Message", {
          body: `${notif.sender?.firstName || "Unknown"} sent you a message`,
          icon: `${BASE_URL}${notif.sender?.profileImage}`,
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
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const subscribeUser = async () => {
    const reg = await navigator.serviceWorker.ready;
    const res = await fetch(`${BASE_URL}/api/push/public-key`);
    const { publicKey } = await res.json();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    await fetch(`${BASE_URL}/api/push/subscribe`, {
      method: "POST",
      body: JSON.stringify(sub),
      headers: { "Content-Type": "application/json" },
    });
  };

  useEffect(() => {
    if (isAuthenticated) subscribeUser();
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
      <div className="min-h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="fixed h-screen w-full overflow-y-auto bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] overflow-x-hidden z-10 text-white ">
      {/* 🔝 HEADER */}
      {!shouldHideHeader && (
        <div className="sticky top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
          {/* HEADER CONTENT (logo, notifications, profile) */}
        </div>
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route path="/profile-image/hirer" element={<ProfileImageforHirer />} />
        <Route path="/profile-preview/hirer" element={<ProfilePreviewforhirer />} />
        <Route path="/profile-image/employee" element={<ProfileImageforEmployee />} />
        <Route path="/profile-preview/employee" element={<ProfilePreviewforEmployee />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />

        <Route path="/Offline/create-post" element={<HirerOfflinePost />} />
        <Route path="/Online/create-post" element={<HirerOnlinePost />} />

        <Route path="/admin/dashboard" element={isAuthenticated && ["admin", "owner"].includes(user?.role) ? <AdminDashboard /> : <Navigate to="/home" replace />} />
        <Route path="/admin/users" element={isAuthenticated && ["admin", "owner"].includes(user?.role) ? <AdminUsers /> : <Navigate to="/home" replace />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />

        <Route path="/onlinejob/:jobId" element={<OnlineJobDetails />} />
        <Route path="/offlinejob/:jobId" element={<OfflineJobDetails />} />
        <Route path="/job-application/:notificationId" element={<JobApplicationDetails />} />

        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/chat-media-editor" element={<ChatMediaEditor />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/profile-image/hirer-edit" element={<ProfileImageforHirerEdit />} />
        <Route path="/profile-preview/hirer-edit" element={<ProfilePreviewforhirerEdit />} />
        <Route path="/profile-image/employee-edit" element={<ProfileImageforEmployeeEdit />} />
        <Route path="/profile-preview/Employee-edit" element={<ProfilePreviewforEmployeeEdit />} />
        <Route path="/settings/hirer/account" element={<HirerAccountEdit user={user} />} />
        <Route path="/settings/security" element={<SecurityHirer />} />
        <Route path="/settings/Email" element={<HirerEmailChanging />} />
        <Route path="/settings/Password" element={<HirerPasswordChanging />} />
        <Route path="/settings/delete" element={<HirerDelete />} />
        <Route path="/settings/logout" element={<Logout />} />
        <Route path="/settings/Employee" element={<EmployeeAccountEdit user={user} />} />

        <Route path="/Hirer/Urgent" element={<HirerOfflineUrgentPost />} />
        <Route path="/urgent-matches/:postId" element={<HirerOfflineUrgentMatches />} />
        <Route path="/hirer/urgent-preview/:postId" element={<UrgentPreview />} />
        <Route path="/hirer-online-urgent-post" element={<HirerOnlineUrgentPost />} />
        <Route path="/online-worker-urgent-posts" element={<OnlineWorkerUrgentPosts />} />
        <Route path="/buy-credits" element={<BuyCredits />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}
