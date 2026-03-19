import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { socket } from "./utils/socket";
import { currencies } from "./constants/currencies";
import { AuthContext } from "./AuthContext";


const UrgentPreview = ({ postId, onClose }) => {
  const {user} = useContext(AuthContext);
  const [allMatches, setAllMatches] = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [hirer, setHirer] = useState(null);
  const [post, setPost] = useState(null);

  const [radius, setRadius] = useState(1000);
  const [displayRadiusKm, setDisplayRadiusKm] = useState(1);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("searching");
  const [unlocked, setUnlocked] = useState(false);

  const intervalRef = useRef(null);
  const pulseRef = useRef(null);
  const baseRadiusRef = useRef(1000);
  const cancelledRef = useRef(false);
  const socketRef = useRef(null);

  useEffect(() => {
  if (!user?._id) return;

  socketRef.current = socket(user._id);

  return () => {
    socketRef.current?.disconnect();
  };
}, [user]);

  /* ================= HELPER ================= */
  const getCurrencySymbol = (code) => {
    return currencies.find((c) => c.code === code)?.symbol || code;
  };

  /* ================= FETCH EMPLOYEES ================= */
  const fetchEmployees = async (r) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/hirer-post/urgent-matches/${postId}?radius=${r}`,
        { withCredentials: true }
      );

      setAllMatches(res.data.allMatches || []);
      setTopMatches(res.data.topMatches || []);
      setLocation(res.data.location);

      // 🔥 Hirer + Post details
      setHirer(res.data.hirer);
      setPost(res.data.post);

      return res.data.topMatches?.length > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  /* ================= SEARCH LOGIC ================= */
  useEffect(() => {
    let timeoutId;

    const runSearch = async () => {
      const found = await fetchEmployees(1000);
      if (found || cancelledRef.current) {
        setStatus("found");
        return;
      }

      timeoutId = setTimeout(() => {
        if (cancelledRef.current) return;

        baseRadiusRef.current = 3000;
        setRadius(3000);
        setDisplayRadiusKm(3);

        intervalRef.current = setInterval(async () => {
          if (cancelledRef.current) return;

          const foundLater = await fetchEmployees(3000);
          if (foundLater) {
            setStatus("found");
            clearInterval(intervalRef.current);
          }
        }, 30000);
      }, 30000);
    };

    runSearch();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalRef.current);
    };
  }, [postId]);

  /* ================= PULSE EFFECT ================= */
  useEffect(() => {
    let grow = true;

    pulseRef.current = setInterval(() => {
      setRadius((prev) => {
        const base = baseRadiusRef.current;
        if (grow && prev >= base + 120) grow = false;
        if (!grow && prev <= base - 120) grow = true;
        return grow ? prev + 5 : prev - 5;
      });
    }, 40);

    return () => clearInterval(pulseRef.current);
  }, []);

  useEffect(() => {
  const socket = socketRef.current;
  if (!socket) return;

  const handler = async () => {
    if (cancelledRef.current) return;
    await fetchEmployees(baseRadiusRef.current);
  };

  socket.on("employee-availability-changed", handler);

  return () => {
    socket.off("employee-availability-changed", handler);
  };
}, [user]);

  /* ================= ACTIONS ================= */
  const cancelSearch = () => {
    cancelledRef.current = true;
    clearInterval(intervalRef.current);
    onClose();
  };

  const unlock = async () => {
    const res = await axios.post(
      `${BASE_URL}/api/hirer-post/unlock/${postId}`,
      {},
      { withCredentials: true }
    );

    setTopMatches(res.data.employees || []);
    setUnlocked(true);
  };

  if (!location) {
    return <p className="text-white p-6">Searching nearby…</p>;
  }

  const [lng, lat] = location;

  return (
    <div className="p-6 bg-[#0F172A]/90 rounded-3xl border border-white/10 text-white space-y-4">

      {/* ================= HIRER CARD ================= */}
      {hirer && post && (
        <div className="p-4 bg-[#111827] rounded-2xl flex gap-4 border border-white/10">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700">
            {hirer.profileImage ? (
              <img
                src={`${BASE_URL}${hirer.profileImage}`}
                alt="Hirer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold">
                {hirer.firstName?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-lg">
              {hirer.firstName} {hirer.lastName}
            </p>

            <p className="text-sm text-indigo-400">
              {post.profession}
            </p>

            <p className="text-sm text-white/70 mt-1">
              {post.description}
            </p>

            {post.price?.type !== "none" && (
              <p className="text-sm mt-2 text-green-400 font-semibold">
                {post.price.type === "expected" && (
                  <>
                    {getCurrencySymbol(post.price.currency)}{" "}
                    {post.price.value}
                  </>
                )}

                {post.price.type === "negotiation" && (
                  <>
                    {getCurrencySymbol(post.price.currency)}{" "}
                    {post.price.min}
                    {" – "}
                    {getCurrencySymbol(post.price.currency)}{" "}
                    {post.price.max}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ================= MAP ================= */}
      <MapContainer center={[lat, lng]} zoom={14} className="h-80 rounded-xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[lat, lng]}>
          <Popup>You are here</Popup>
        </Marker>

        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{ color: "#6366F1", fillOpacity: 0.15 }}
        />

        {allMatches.map((m) => {
          if (!m.location) return null;
          const [empLng, empLat] = m.location;

          return (
            <Marker
              key={m._id}
              position={[empLat, empLng]}
              opacity={m.isLive ? 1 : 0.4}
            >
              <Popup>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm">{m.profession}</p>
                <p
                  className={`text-xs ${
                    m.isLive ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {m.isLive ? "Live" : "Offline"}
                </p>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {status === "searching" && (
        <>
          <p className="text-yellow-400">
            Scanning within {displayRadiusKm} KM…
          </p>
          <button
            onClick={cancelSearch}
            className="w-full py-2 rounded-xl bg-red-600 font-semibold"
          >
            Cancel Search
          </button>
        </>
      )}

      {/* ================= TOP MATCHES ================= */}
      {topMatches.map((m) => (
        <div
          key={m._id}
          className="p-3 bg-[#111827] rounded-xl flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            {m.profileImage ? (
              <img
                src={`${BASE_URL}${m.profileImage}`}
                alt="Employee"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold">
                {m.avatarInitial || "?"}
              </div>
            )}
          </div>

          <div>
            <p className="font-semibold">
              {unlocked ? m.firstName : m.name}
            </p>
            <p className="text-sm text-white/60">{m.profession}</p>
          </div>
        </div>
      ))}

      {topMatches.length > 0 && !unlocked && (
        <button
          onClick={unlock}
          className="w-full py-3 bg-green-600 rounded-xl font-semibold"
        >
          Pay ₹30 to View Top Employees
        </button>
      )}
    </div>
  );
};

export default UrgentPreview;