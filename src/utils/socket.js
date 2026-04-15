import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { BASE_URL } from "../config";

export const socket = io(BASE_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"], // force websocket first
  auth: { userId: Cookies.get("userId") },
});
