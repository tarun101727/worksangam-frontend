import { useEffect, useState, useRef ,useLayoutEffect  } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { socket } from "./utils/socket";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";



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
const [previewMedia, setPreviewMedia] = useState(null);
const galleryInputRef = useRef(null);
const cameraInputRef = useRef(null);
const textareaRef = useRef(null);
const messagesEndRef = useRef(null);
const [receiver,setReceiver] = useState(null);

/* GET COOKIE FUNCTION */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const userId = getCookie("userId");

const messagesContainerRef = useRef(null);



/* AUTO SCROLL */
useLayoutEffect(() => {
  // Scroll instantly to bottom after messages render
  messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
}, [messages]);

/* LOAD CHAT + SOCKET */
useEffect(()=>{

socket.emit("join-chat",chatId);

axios.get(`${BASE_URL}/api/chat/messages/${chatId}`,{
withCredentials:true
})
.then(res=>{

setMessages(res.data.messages);

const otherUser = res.data.participants.find(
p => p._id !== userId
);

setReceiver(otherUser);

});

/* SOCKET LISTENER */
socket.off("receive-message").on("receive-message",(msg)=>{
setMessages(prev=>[...prev,msg]);
});

return ()=>socket.off("receive-message");

},[chatId]);

/* SEND MESSAGE */
const sendMessage = async ()=>{

if(!text.trim()) return;

await axios.post(
`${BASE_URL}/api/chat/send/${chatId}`,
{ message:text },
{ withCredentials:true }
);

setText("");

if (textareaRef.current) {
  textareaRef.current.style.height = "auto";
  textareaRef.current.style.overflowY = "hidden";
}

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

  setText(e.target.value);

  const textarea = textareaRef.current;

  textarea.style.height = "auto";

  const maxHeight = 24 * 3 + 16; 
  // lineHeight(24px) * 3 rows + padding

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

return(

<div className="flex flex-col h-[100dvh]">

{/* MESSAGE AREA */}
<div
  className="flex-1 p-4 overflow-y-auto"
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
This is the beginning of your conversation with
</p>

<p className="text-white font-semibold">
{receiver.firstName} {receiver.lastName}
</p>

</div>

)}

{/* NO CHAT MESSAGE */}


{messages.map((m,i)=>{

const isSender = m.sender?._id === userId;

return(

<div
key={i}
className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
>

{/* RECEIVER MESSAGE */}

{!isSender && (

<div className="flex items-end gap-2">

<img
src={getImageUrl(m.sender?.profileImage)}
className="w-8 h-8 rounded-full object-cover"
/>

<div className="flex flex-col max-w-xs">

{/* IMAGE / VIDEO (NO BACKGROUND) */}
{m.image && (
<div
className="relative mb-1 max-w-xs cursor-pointer group"
onClick={()=>setPreviewMedia(`${BASE_URL}/uploads/${m.image}`)}
>

{m.image.match(/\.(mp4|webm|ogg)$/i) ? (

<video
src={`${BASE_URL}/uploads/${m.image}`}
className="rounded-lg max-w-xs"
controls
/>

) : (

<img
src={`${BASE_URL}/uploads/${m.image}`}
className="rounded-lg max-w-xs"
/>

)}

{/* HOVER VIEW TEXT */}
<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">

<span className="text-white text-sm font-semibold">
View
</span>

</div>

</div>
)}

{/* TEXT MESSAGE */}
{m.message && (
  <div className={`px-3 py-2 rounded-xl max-w-xs break-words ${isSender ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-white'}`}>
    {m.message.startsWith("📍 Location:") ? (
      <a
        href={m.message.replace("📍 Location:", "").trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-white hover:text-gray-200"
      >
        Shared a location(click to see location)
      </a>
    ) : (
      m.message
    )}
  </div>
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

<div className="flex flex-col items-end max-w-xs">

{/* IMAGE / VIDEO (NO BACKGROUND) */}
{m.image && (
  <div
    className="relative mb-1 max-w-xs cursor-pointer group"
    onClick={() => setPreviewMedia(`${BASE_URL}/uploads/${m.image}`)}
  >

    {m.image.match(/\.(mp4|webm|ogg)$/i) ? (
      <video
        src={`${BASE_URL}/uploads/${m.image}`}
        className="rounded-lg max-w-xs"
        controls
      />
    ) : (
      <img
src={`${BASE_URL}/uploads/${m.image}`}
className="rounded-lg w-[220px] h-[220px] object-cover"
/>
    )}

    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-lg">
      <span className="text-white text-sm font-semibold">
        View
      </span>
    </div>

  </div>
)}

{/* TEXT MESSAGE */}
{m.message && (
  <div className={`px-3 py-2 rounded-xl max-w-xs break-words ${isSender ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-white'}`}>
    {m.message.startsWith("📍 Location:") ? (
      <a
        href={m.message.replace("📍 Location:", "").trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-white hover:text-gray-100"
      >
         Shared a location(click to see location)
      </a>
    ) : (
      m.message
    )}
  </div>
)}

</div>

</div>

)}

</div>

)

})}

<div ref={messagesEndRef}></div>

</div>

{/* MESSAGE INPUT */}

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

Gallery

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

Camera

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
  Location
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
placeholder="Type a message..."
className="flex-1 p-2 bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] border border-white/20 rounded outline-none resize-none leading-6 scrollbar-dark "
/>

<button
onClick={sendMessage}
className="bg-indigo-500 px-4 h-10 flex items-center justify-center rounded hover:bg-indigo-600 transition flex-shrink-0"
>
Send
</button> 

</div>

{/* MEDIA PREVIEW */}

{previewMedia && (

<div
className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
onClick={()=>setPreviewMedia(null)}
>

{previewMedia.match(/\.(mp4|webm|ogg)$/i) ? (

<video
src={previewMedia}
controls
autoPlay
className="max-h-[90%] max-w-[90%] rounded-lg"
/>

) : (

<img
src={previewMedia}
className="max-h-[90%] max-w-[90%] rounded-lg"
/>

)}

</div>

)}
</div>

);

}
