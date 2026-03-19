import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";

export default function ChatNotificationDropdown({ notifications, close }) {
  const navigate = useNavigate();

  if (!notifications.length) {
    return (
      <div className="absolute right-0 top-12 w-80 bg-[#0F172A] border border-white/10 rounded-xl p-4">
        <p className="text-white/60 text-sm">No notifications</p>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-12 w-80 bg-[#0F172A] border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto scrollbar-dark">
      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => {
            navigate(`/chat/${n.chat}`);
            close();
          }}
          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer"
        >
          {n.sender?.profileImage ? (
            <img
              src={`${BASE_URL}${n.sender.profileImage}`}
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
            <b>{n.sender?.firstName} {n.sender?.lastName}</b>:{" "}: {n.message?.slice(0, 30)}...
          </p>
        </div>
      ))}
    </div>
  );
}