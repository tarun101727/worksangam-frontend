import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../config";

export const useJobNotifications = (userId) => {
  const [notification, setNotification] = useState(null);
  const [jobTaken, setJobTaken] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(BASE_URL, {
      auth: { userId },
      withCredentials: true,
    });

    socket.on("new-job-request", (data) => {
      setNotification(data);
    });

    socket.on("job-taken", (data) => {
      setJobTaken(data);
    });

    return () => socket.disconnect();
  }, [userId]);

  return {
    notification,
    jobTaken,
    clear: () => setNotification(null),
  };
};
