import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const getImageUrl = (img) => {
  if (!img) return null;

  const clean = img.trim();

  if (clean.startsWith("http")) return clean;

  return `${BASE_URL}${clean}`;
};

export default function Chats() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const userId = user?._id;

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

      {chats.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No conversations yet.
        </div>
      )}

      {chats.map((chat) => {
        if (!userId) return null;

        const other = chat.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        if (!other) return null;

        return (
          <div
            key={chat._id}
            onClick={() => navigate(`/chat/${chat._id}`)}
            className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-white/5 transition"
          >
            <img
              src={
                getImageUrl(other.profileImage) ||
                `https://ui-avatars.com/api/?name=${other.firstName}+${other.lastName}`
              }
              className="w-10 h-10 rounded-full object-cover"
            />

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
