import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useTranslation } from "react-i18next";



const getImageUrl = (img) => {
  if (!img) return null;

  const clean = img.trim();

  if (clean.startsWith("http")) return clean;

  return `${BASE_URL}${clean}`;
};

export default function Chats() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const userId = user?._id;
  const { t } = useTranslation();

  useEffect(() => {
  axios
    .get(`${BASE_URL}/api/chat`, {
      withCredentials: true,
    })
    .then((res) => setChats(res.data))
    .catch((err) => console.error(err))
    .finally(() => setLoading(false)); // ✅ only stop loading
}, []);

if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mb-4">{t("Messages")}</h2>

      {chats.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          {t("No conversations yet")}
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
