import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { BASE_URL } from "../config"; // make sure config.js exports BASE_URL

export const socket = io(BASE_URL, {
  withCredentials: true,
  autoConnect: false, // ✅ IMPORTANT
});
