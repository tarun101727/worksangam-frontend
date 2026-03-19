import { io } from "socket.io-client";
import Cookies from "js-cookie";

export const socket = io("https://api.workSangam.in", {
  withCredentials: true,
  auth: { userId: Cookies.get("userId") },
});