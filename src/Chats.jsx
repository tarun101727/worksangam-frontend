import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";

const getImageUrl = (img) => {
  if (!img) return null;

  const clean = img.trim();

  if (clean.startsWith("http")) return clean;

  return `${BASE_URL}${clean}`;
};

export default function Chats() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  /* GET COOKIE FUNCTION */
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const userId = getCookie("userId");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/chat`, {
        withCredentials: true,
      })
      .then((res) => setChats(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mb-4">Messages</h2>

      {/* EMPTY CHAT MESSAGE */}
      {chats.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No conversations yet.
          <br />
          Once you start chatting with a hirer or employee, your messages will appear here.
        </div>
      )}

      {chats.map((chat) => {
        /* 🚨 IMPORTANT FIX: convert both to string */
        const other = chat.participants.find(
          (p) => p._id?.toString() !== userId?.toString()
        );

        /* SAFETY CHECK */
        if (!other) return null;

        return (
          <div
            key={chat._id}
            onClick={() => navigate(`/chat/${chat._id}`)}
            className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-white/5 transition"
          >
            {/* PROFILE IMAGE */}
            <img
              src={
                getImageUrl(other.profileImage) ||
                `https://ui-avatars.com/api/?name=${other.firstName}+${other.lastName}`
              }
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* NAME */}
            <div>
              <p className="font-medium">
                {other.firstName} {other.lastName}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
