import { useEffect, useState, useRef ,useLayoutEffect  } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from "./utils/socket";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useTranslation } from "react-i18next";


const getImageUrl = (img) => {
  if (!img) return null;

  const clean = img.trim();

  if (clean.startsWith("http")) return clean;

  return `${BASE_URL}${clean}`;
};


export default function ChatPage() {

const { chatId } = useParams();
const navigate = useNavigate();
const [messages,setMessages] = useState([]);
const [text,setText] = useState("");
const [showMediaBox,setShowMediaBox] = useState(false);
const galleryInputRef = useRef(null);
const cameraInputRef = useRef(null);
const textareaRef = useRef(null);
const messagesEndRef = useRef(null);
const [receiver,setReceiver] = useState(null);
const { user } = useContext(AuthContext);
const userId = user?._id;
const [selectedMedia, setSelectedMedia] = useState(null);
const messagesContainerRef = useRef(null);
const [isTyping, setIsTyping] = useState(false);
const [loading, setLoading] = useState(true);
const [openMenuId, setOpenMenuId] = useState(null);
const [replyMessage, setReplyMessage] = useState(null);
const isTypingRef = useRef(false);
const messageRefs = useRef({});
const [highlightedId, setHighlightedId] = useState(null);
const [showScrollDown, setShowScrollDown] = useState(false);
const { t } = useTranslation();

useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setShowScrollDown(distanceFromBottom > 150);
  };

  handleScroll();

  container.addEventListener("scroll", handleScroll);

  return () => container.removeEventListener("scroll", handleScroll);
}, [messages]);




const scrollToBottom = () => {
  const container = messagesContainerRef.current;

  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
};

const selectReply = (msg) => {
  setReplyMessage(msg);
  setOpenMenuId(null);

  setTimeout(() => {
    textareaRef.current?.focus();

    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, 150);
};

const openMedia = (mediaUrl) => {
  setSelectedMedia(mediaUrl);
};

const closeMedia = () => {
  setSelectedMedia(null);
};

useLayoutEffect(() => {
  const container = messagesContainerRef.current;

  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}, [messages]);

useEffect(() => {

  socket.emit("join-chat", chatId);

  axios
    .get(`${BASE_URL}/api/chat/messages/${chatId}`, {
      withCredentials: true,
    })
    .then((res) => {
      setMessages(res.data.messages);

      const otherUser = res.data.participants.find(
        (p) => p._id.toString() !== userId?.toString()
      );

      setReceiver(otherUser);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setLoading(false); // ✅ ONLY THIS IS NEEDED
    });

  socket.off("receive-message").on("receive-message", (msg) => {
    setMessages((prev) => {
      const exists = prev.some(
        (m) =>
          m.message === msg.message &&
          m.sender?._id === msg.sender?._id
      );

      if (exists) return prev;

      return [...prev, msg];
    });
  });

  socket.off("user-typing").on("user-typing", ({ userId: typingUserId }) => {
    if (typingUserId !== userId) {
      setIsTyping(true);
    }
  });

  socket
    .off("user-stop-typing")
    .on("user-stop-typing", ({ userId: typingUserId }) => {
      if (typingUserId !== userId) {
        setIsTyping(false);
      }
    });

  return () => {
    socket.off("receive-message");
    socket.off("user-typing");
    socket.off("user-stop-typing");
  };

}, [chatId]);

const sendMessage = () => {
  if (!text.trim()) return;

  const messageText = text;

  const tempMessage = {
    _id: "temp-" + Date.now(),
    message: messageText,
    sender: {
      _id: userId,
      profileImage: user?.profileImage,
      firstName: user?.firstName,
      lastName: user?.lastName
    },
    replyTo: replyMessage?._id || null,
    replyText: replyMessage?.message || ""
  };

  setMessages(prev => [...prev, tempMessage]);

  setText("");
  setReplyMessage(null);

  socket.emit("stop-typing", { chatId, userId });

  socket.emit("send-message", tempMessage);

  axios.post(
    `${BASE_URL}/api/chat/send/${chatId}`,
    {
      message: messageText,
      replyTo: replyMessage?._id || null,
      replyText: replyMessage?.message || ""
    },
    { withCredentials: true }
  );
};

const openGallery = () => {
  galleryInputRef.current.click();
};

const openCamera = () => {
  cameraInputRef.current.click();
};

const handleFile = (e) => {

  const file = e.target.files[0];
  if(!file) return;

  const imageUrl = URL.createObjectURL(file);

  navigate("/chat-media-editor", {
    state: {
      file,
      imageUrl,
      chatId
    }
  });

};


const handleTextChange = (e) => {
  const value = e.target.value;
  setText(value);

  // ✅ START TYPING (ONLY ONCE)
  if (value.trim().length > 0 && !isTypingRef.current) {
    socket.emit("typing", { chatId, userId });
    isTypingRef.current = true;
  }

  // ✅ STOP TYPING (ONLY WHEN EMPTY)
  if (value.trim().length === 0 && isTypingRef.current) {
    socket.emit("stop-typing", { chatId, userId });
    isTypingRef.current = false;
  }

  // textarea resize (same)
  const textarea = textareaRef.current;

  textarea.style.height = "auto";

  const maxHeight = 24 * 3 + 16;

  if (textarea.scrollHeight > maxHeight) {
    textarea.style.height = maxHeight + "px";
    textarea.style.overflowY = "auto";
  } else {
    textarea.style.height = textarea.scrollHeight + "px";
    textarea.style.overflowY = "hidden";
  }
};

const sendLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      // Detect Android or iOS
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      // Construct map link
      let mapLink = "";
      if (isAndroid) {
        mapLink = `geo:${latitude},${longitude}?q=${latitude},${longitude}(You)`;
      } else if (isIOS) {
        mapLink = `http://maps.apple.com/?ll=${latitude},${longitude}`;
      } else {
        mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      }

      const locationMessage = `📍 Location: ${mapLink}`;

      await axios.post(
        `${BASE_URL}/api/chat/send/${chatId}`,
        { message: locationMessage },
        { withCredentials: true }
      );

       // ✅ CLOSE + MENU
      setShowMediaBox(false);

      // Optionally scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    (error) => {
      console.error(error);
      alert("Unable to fetch your location");
    }
  );
};

const handleKeyDown = (e) => {
  // MOBILE → always allow new line
  if (window.innerWidth < 768) return;

  // DESKTOP
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // stop new line
    sendMessage();
  }
};

const toggleMenu = (id) => {
  setOpenMenuId(openMenuId === id ? null : id);
};

const deleteMessage = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/api/chat/message/${id}`, {
      withCredentials: true,
    });

    setMessages((prev) => prev.filter((m) => m._id !== id));
    setOpenMenuId(null);
  } catch (err) {
    console.error(err);
  }
};

const reportMessage = async (id) => {
  try {
    await axios.post(
      `${BASE_URL}/api/chat/report/${id}`,
      {},
      { withCredentials: true }
    );

    alert("Reported successfully");
    setOpenMenuId(null);
  } catch (err) {
    console.error(err);
  }
};

const copyMessage = (text) => {
  navigator.clipboard.writeText(text);
  setOpenMenuId(null);
};

const scrollToReplyMessage = (replyId) => {
  if (!replyId) return;

  const target = messageRefs.current[replyId];

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setHighlightedId(replyId);

    setTimeout(() => {
      setHighlightedId(null);
    }, 2000);
  }
};

if (loading && messages.length === 0) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

return(
<div className="flex flex-col h-screen">
{showScrollDown && (
  <button
    onClick={scrollToBottom}
    className="fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-xl flex items-center justify-center transition-all duration-300"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 14l-7 7-7-7M12 21V3"
      />
    </svg>
  </button>
)}
{/* MESSAGE AREA */}
<div
  className="flex-1 p-4 overflow-y-auto no-scrollbar"
  ref={messagesContainerRef}
>
  {/* CHAT START MESSAGE */}

{receiver && (

<div className="flex flex-col items-center mb-6">

<img
src={getImageUrl(receiver.profileImage)}
className="w-14 h-14 rounded-full object-cover mb-2"
/>
<p className="text-gray-400 text-sm">
{t("This is the beginning of your conversation with")}
</p>

<p className="text-white font-semibold">
{receiver.firstName} {receiver.lastName}
</p>

</div>

)}

{/* NO CHAT MESSAGE */}
{messages.map((m,i)=>{

const isSender = m.sender?._id?.toString() === userId?.toString();
return(

<div
key={i}
ref={(el) => (messageRefs.current[m._id] = el)}
className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
>

{/* RECEIVER MESSAGE */}

{!isSender && (

<div className="flex items-end gap-2">

<img
src={getImageUrl(m.sender?.profileImage)}
className="w-8 h-8 rounded-full object-cover"
/>

<div className="flex flex-col max-w-xs relative">

<button
  onClick={() => toggleMenu(m._id)}
  className="absolute top-1 -right-7 p-1 text-white hover:text-white"
>
  ⋮
</button>

{openMenuId === m._id && (
  <div className="absolute top-8 -right-[145px] bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[130px]">

    <button
      onClick={() => copyMessage(m.message)}
      className="block w-full text-left px-4 py-2 hover:bg-white/10"
    >
      Copy
    </button>

    <button
      onClick={() => reportMessage(m._id)}
      className="block w-full text-left px-4 py-2 hover:bg-white/10"
    >
      Report
    </button>

    {m.sender?._id === userId && (
      <button
        onClick={() => deleteMessage(m._id)}
        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
      >
        Delete
      </button>
    )}

    <button
  onClick={() => selectReply(m)}
  className="block w-full text-left px-4 py-2 hover:bg-white/10"
>
  Reply
</button>

  </div>
)}

{m.image ? (
  <div
    className={`rounded-xl overflow-hidden max-w-xs ${
      isSender ? "bg-indigo-500" : "bg-gray-700"
    }`}
  >
    {/* IMAGE */}
    <div
      className="cursor-pointer"
      onClick={() => openMedia(getImageUrl(m.image))}
    >
      {m.image.match(/\.(mp4|webm|ogg)$/i) ? (
        <video src={getImageUrl(m.image)} className="w-full" />
      ) : (
        <img src={getImageUrl(m.image)} className="w-full" />
      )}
    </div>

    {/* CAPTION */}
    {m.message && (
      <div className="px-3 py-2 text-white break-words">
        {m.message}
      </div>
    )}
  </div>
) : (
  m.message && (
   <div
className={`px-3 py-2 rounded-xl max-w-xs break-words transition-all duration-500 ${
  highlightedId === m._id
    ? "animate-pulse ring-2 ring-green-400 shadow-[0_0_25px_rgba(34,197,94,0.9)] scale-105"
    : isSender
    ? "bg-indigo-500 text-white"
    : "bg-gray-700 text-white"
}`}
>
      {m.replyText && (
  <div
    onClick={() => scrollToReplyMessage(m.replyTo)}
    className="mb-2 px-2 py-1 bg-black/20 rounded text-xs text-gray-300 border-l-4 border-indigo-400 cursor-pointer hover:bg-black/30"
  >
    {m.replyText}
  </div>
)}
      {m.message.startsWith("📍 Location:") ? (
        <a
          href={m.message.replace("📍 Location:", "").trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {t("Shared a location(click to see location)")}
        </a>
      ) : (
        m.message
      )}
    </div>
  )
)}

</div>

</div>

)}

{/* SENDER MESSAGE */}

{isSender && (

<div className="flex items-end gap-2 flex-row-reverse">

<img
src={getImageUrl(m.sender?.profileImage)}
className="w-8 h-8 rounded-full object-cover"
/>

<div className="flex flex-col max-w-xs relative">

<button
  onClick={() => toggleMenu(m._id)}
  className="absolute top-1 -left-7 p-1 text-white hover:text-white"
>
  ⋮
</button>

{openMenuId === m._id && (
  <div className="absolute top-8 -left-[145px] bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[130px]">

    <button
      onClick={() => copyMessage(m.message)}
      className="block w-full text-left px-4 py-2 hover:bg-white/10"
    >
      Copy
    </button>

    <button
      onClick={() => reportMessage(m._id)}
      className="block w-full text-left px-4 py-2 hover:bg-white/10"
    >
      Report
    </button>

    {m.sender?._id === userId && (
      <button
        onClick={() => deleteMessage(m._id)}
        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
      >
        Delete
      </button>
    )}

    <button
  onClick={() => selectReply(m)}
  className="block w-full text-left px-4 py-2 hover:bg-white/10"
>
  Reply
</button>

  </div>
)}

{m.image ? (
  <div
    className={`rounded-xl overflow-hidden max-w-xs ${
      isSender ? "bg-indigo-500" : "bg-gray-700"
    }`}
  >
    {/* IMAGE */}
    <div
      className="cursor-pointer"
      onClick={() => openMedia(getImageUrl(m.image))}
    >
      {m.image.match(/\.(mp4|webm|ogg)$/i) ? (
        <video src={getImageUrl(m.image)} className="w-full" />
      ) : (
        <img src={getImageUrl(m.image)} className="w-full" />
      )}
    </div>

    {/* CAPTION */}
    {m.message && (
      <div className="px-3 py-2 text-white break-words">
        {m.message}
      </div>
    )}
  </div>
) : (
  m.message && (
    <div
className={`px-3 py-2 rounded-xl max-w-xs break-words transition-all duration-500 ${
  highlightedId === m._id
    ? "animate-pulse ring-2 ring-green-400 shadow-[0_0_25px_rgba(34,197,94,0.9)] scale-105"
    : isSender
    ? "bg-indigo-500 text-white"
    : "bg-gray-700 text-white"
}`}
>
      {m.replyText && (
  <div
    onClick={() => scrollToReplyMessage(m.replyTo)}
    className="mb-2 px-2 py-1 bg-black/20 rounded text-xs text-gray-300 border-l-4 border-indigo-400 cursor-pointer hover:bg-black/30"
  >
    {m.replyText}
  </div>
)}
      {m.message.startsWith("📍 Location:") ? (
        <a
          href={m.message.replace("📍 Location:", "").trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {t("Shared a location(click to see location)")}
        </a>
      ) : (
        m.message
      )}
    </div>
  )
)}

</div>

</div>

)}

</div>

)

})}

{isTyping && (
  <div className="px-4 pb-9 text-gray-400 text-sm">
    {receiver?.firstName} {t("Typing . . .")}
  </div>
)}

<div ref={messagesEndRef}></div>
</div>


{replyMessage && (
  <div className="mb-2 bg-gray-800 p-2 rounded-lg border-l-4 border-indigo-500">
    <div className="text-xs text-gray-400">Replying to</div>
    <div className="text-sm truncate">{replyMessage.message}</div>

    <button
      onClick={() => setReplyMessage(null)}
      className="text-red-400 text-xs mt-1"
    >
      Cancel
    </button>
  </div>
)}

{/* MESSAGE INPUT */}
<div className="sticky bottom-0 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] border-t border-white/10 p-4 flex gap-2 items-end">

{/* PLUS BUTTON */}

<button
onClick={()=>setShowMediaBox(!showMediaBox)}
className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-full hover:bg-white/10 transition"
>

{/* PLUS CIRCLE SVG */}

<svg
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
className="w-6 h-6"
>
<circle cx="12" cy="12" r="10"/>
<path d="M12 8v8M8 12h8"/>
</svg>

</button>

{/* HIDDEN MEDIA BOX */}

{showMediaBox && (

<div className="absolute bottom-16 left-4 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] border border-white/10 rounded-xl p-4 flex gap-4 shadow-xl">

{/* GALLERY */}

<button
onClick={openGallery}
className="flex flex-col items-center text-sm hover:opacity-80"
>

<svg
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
className="w-8 h-8"
>
<rect x="3" y="3" width="18" height="18" rx="2"/>
<circle cx="8.5" cy="8.5" r="1.5"/>
<path d="M21 15l-5-5L5 21"/>
</svg>

{t("Gallery")}

</button>

{/* CAMERA */}

<button
onClick={openCamera}
className="flex flex-col items-center text-sm hover:opacity-80"
>

<svg
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
className="w-8 h-8"
>
<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
<circle cx="12" cy="13" r="4"/>
</svg>

{t("Camera")}

</button>
{/* LOCATION */}
<button
  onClick={sendLocation}
  className="flex flex-col items-center text-sm hover:opacity-80"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-8 h-8"
  >
    <path d="M12 2C8 8 4 12 12 22c8-10 4-14 0-20z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
  {t("Location")}
</button>
</div>

)}

{/* HIDDEN INPUTS */}

<input
type="file"
accept="image/*,video/*"
ref={galleryInputRef}
onChange={handleFile}
className="hidden"
/>

<input
type="file"
accept="image/*"
capture
ref={cameraInputRef}
onChange={handleFile}
className="hidden"
/>


{/* TEXT INPUT */}

<textarea
ref={textareaRef}
rows={1}
value={text}
onChange={handleTextChange}
 onKeyDown={handleKeyDown}
placeholder="Type a message..."
className="flex-1 p-2 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] border border-white/20 rounded outline-none resize-none leading-6 scrollbar-dark "
/>

<button
onClick={sendMessage}
className="bg-indigo-500 px-4 h-10 flex items-center justify-center rounded hover:bg-indigo-600 transition flex-shrink-0"
>
{t("Send")}
</button> 

</div>




{selectedMedia && (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    onClick={closeMedia}
  >
    {/* CLOSE BUTTON */}
    <button
      className="absolute top-4 right-4 text-white text-3xl font-bold"
      onClick={closeMedia}
    >
      ✕
    </button>

    {/* MEDIA */}
    {selectedMedia.match(/\.(mp4|webm|ogg)$/i) ? (
      <video
        src={selectedMedia}
        controls
        autoPlay
        className="max-h-[90vh] max-w-[95vw] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    ) : (
      <img
        src={selectedMedia}
        className="max-h-[90vh] max-w-[95vw] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    )}
  </div>
)}

</div>

);

}
