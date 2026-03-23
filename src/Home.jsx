import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./config";
import { socket } from "./utils/socket";

export default function Home() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [error, setError] = useState("");
  const [selectedTab, setSelectedTab] = useState("online");

  const [search, setSearch] = useState("");
  const [professions, setProfessions] = useState([]);
  const [filteredProfessions, setFilteredProfessions] = useState([]);

  const locationWatchIdRef = useRef(null);
  const lastCoordsRef = useRef(null);

  const formatPrice = (price) => {
    if (!price) return "Contact for pricing";
    if (price.type === "fixed") return `${price.currency} ${price.value}`;
    if (price.type === "hourly") return `${price.currency} ${price.value}/hr`;
    if (price.type === "negotiable")
      return `${price.currency} ${price.min} – ${price.max}`;
    if (price.type === "inspect_quote") return "Inspect & Quote";
    return "Not disclosed";
  };

  // ======================= USER =======================
  const checkUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/get-current-user`, {
        withCredentials: true,
      });
      setUser(res.data.user);

      if (!window.location.pathname.includes("/urgent")) startLocationTracking();
    } catch (err) {
      console.error(err);
      setError("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("job-taken", ({ jobId }) => {
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    });
    return () => {
      socket.off("job-taken");
    };
  }, []);

  useEffect(() => {
    checkUser();
    return () => {
      if (locationWatchIdRef.current !== null)
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
    };
  }, []);

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;
    if (locationWatchIdRef.current !== null) return;

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (lastCoordsRef.current) {
          const latDiff = Math.abs(lastCoordsRef.current.latitude - latitude);
          const lngDiff = Math.abs(lastCoordsRef.current.longitude - longitude);
          if (latDiff + lngDiff < 0.0005) return;
        }

        lastCoordsRef.current = { latitude, longitude };

        axios
          .post(
            `${BASE_URL}/api/auth/save-location`,
            { latitude, longitude },
            { withCredentials: true }
          )
          .catch(() => {});
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  // ======================= FETCH EMPLOYEES =======================
  const fetchEmployees = async (status, professionType, profession = "") => {
    try {
      let url = "";

      if (status === "offline" && !profession) {
        url = `${BASE_URL}/api/auth/employees/nearby-offline`;
      } else {
        url = `${BASE_URL}/api/users/${status}?professionType=${professionType}&profession=${encodeURIComponent(
          profession
        )}`;
      }

      const res = await axios.get(url, { withCredentials: true });
      setEmployees(res.data.employees || []);
    } catch {
      setError("Failed to fetch employees");
    }
  };

  // ======================= FETCH JOBS =======================
  const fetchJobsByType = async (type) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/all?type=${type}`, {
        withCredentials: true,
      });
      setJobs(res.data.jobs || []);
    } catch {
      setError(`Failed to fetch ${type} jobs`);
    }
  };

  const fetchMyHirerJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/hirer/my-posts`, {
        withCredentials: true,
      });
      setJobs(res.data.jobs || []);
    } catch {
      setError("Failed to load your posts");
    }
  };

  // ======================= FETCH PROFESSIONS =======================
  const fetchProfessions = async () => {
    try {
      if (selectedTab === "online") {
        const res = await axios.get(`${BASE_URL}/api/online-professions`, {
          withCredentials: true,
        });
        setProfessions(res.data.professions || []);
      }
      if (selectedTab === "offline") {
        const res = await axios.get(`${BASE_URL}/api/offline-professions`, {
          withCredentials: true,
        });
        setProfessions(res.data.professions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================= TAB CHANGE EFFECT =======================
  useEffect(() => {
    if (!user) return;

    setSearch("");
    setFilteredProfessions([]);
    setEmployees([]);
    setJobs([]);

    if (selectedTab === "online" || selectedTab === "offline") {
      const professionType = selectedTab;
      fetchEmployees(selectedTab, professionType);
      fetchProfessions();
    }

    if (selectedTab === "online-jobs") fetchJobsByType("online");
    if (selectedTab === "offline-jobs") fetchJobsByType("offline");
    if (selectedTab === "my-job-posts" && user.role === "hirer") fetchMyHirerJobs();
  }, [user, selectedTab]);

  // ======================= SEARCH / FILTER =======================
  const handleSearch = (value) => {
    setSearch(value);

    if (!value) {
      setFilteredProfessions([]);
      // reset list when search is cleared
      if (selectedTab === "online" || selectedTab === "offline") {
        const professionType = selectedTab;
        fetchEmployees(selectedTab, professionType);
      }
      if (selectedTab === "online-jobs") fetchJobsByType("online");
      return;
    }

    const filtered = professions.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProfessions(filtered);
  };

  const selectProfession = (professionName) => {
    setSearch(professionName);
    setFilteredProfessions([]);
    setEmployees([]); // clear old employees immediately

    if (selectedTab === "online" || selectedTab === "offline") {
      const professionType = selectedTab;
      fetchEmployees(selectedTab, professionType, professionName);
    }
  };

  const fetchOfflineJobsByDistance = async (distanceKm) => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async () => {

      try {
        const res = await axios.get(
          `${BASE_URL}/api/jobs/offline-nearby?distanceKm=${distanceKm}`,
          { withCredentials: true }
        );
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch offline jobs by distance");
      }
    },
    (err) => {
      console.error("Geolocation error:", err);
      setError("Unable to get your location");
    },
    { enableHighAccuracy: true }
  );
};

  if (loading) return null;

  return (
    <div className="pt-16">
      {error && <p className="text-red-400 text-center mb-6">{error}</p>}

      {/* ======================= TABS ======================= */}
      <div className="flex flex-wrap justify-around gap-3 mb-6">
        {["online", "offline", "online-jobs", "offline-jobs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`${
              selectedTab === tab ? "bg-[#6366F1]" : "bg-[#1f2937]"
            } py-2 px-4 rounded-xl`}
          >
            {tab === "online" && "Online Employees"}
            {tab === "offline" && "Offline Employees"}
            {tab === "online-jobs" && "Online Jobs"}
            {tab === "offline-jobs" && "Offline Jobs"}
          </button>
        ))}

        {user?.role === "hirer" && (
          <button
            onClick={() => setSelectedTab("my-job-posts")}
            className={`${
              selectedTab === "my-job-posts" ? "bg-[#22c55e]" : "bg-[#1f2937]"
            } py-2 px-4 rounded-xl`}
          >
            My Job Posts
          </button>
        )}
      </div>

      {/* ======================= SEARCH BAR ======================= */}
      {(selectedTab === "online" || selectedTab === "offline") && (
        <div className="max-w-3xl mx-auto mb-4 relative">
          <input
            type="text"
            placeholder={
              selectedTab === "online"
                ? "Search online profession..."
                : "Search offline profession..."
            }
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/10"
          />
          {filteredProfessions.length > 0 && (
            <div className="absolute w-full bg-[#0F172A] border border-white/10 rounded-xl mt-1 max-h-60 overflow-y-auto z-50">
              {filteredProfessions.map((p) => (
                <div
                  key={p._id}
                  onClick={() => selectProfession(p.name)}
                  className="p-3 hover:bg-[#1F2937] cursor-pointer"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= EMPLOYEES ======================= */}
      {(selectedTab === "online" || selectedTab === "offline") && (
        <div className="max-w-3xl mx-auto space-y-4">
          {employees.length === 0 && (
            <p className="text-center text-white/60 py-10">
              {selectedTab === "online" && "No online employees available"}
              {selectedTab === "offline" && "No offline employees available"}
            </p>
          )}

          {employees.map((emp) => (
            <div
              key={emp._id}
              onClick={() => navigate(`/profile/${emp._id}`)}
              className="cursor-pointer p-5 rounded-2xl bg-[#0F172A] border border-white/10"
            >
              <div className="flex items-center space-x-4">
                {emp.profileImage ? (
                  <img
                   src={
  emp.profileImage?.startsWith("http")
    ? emp.profileImage
    : `${BASE_URL}${emp.profileImage}`
}
                    alt={emp.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.avatarInitial}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{emp.profession}</h3>
                  <p className="text-white/70">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-sm text-white/50">
                    {emp.isAvailable ? "Online" : "Offline"}
                  </p>

                  {emp.distanceKm !== undefined && (
                    <p className="text-xs text-blue-400">{emp.distanceKm} km away</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================= ONLINE JOBS SEARCH ======================= */}
      {selectedTab === "online-jobs" && (
        <div className="max-w-3xl mx-auto mb-4 relative">
          <input
            type="text"
            placeholder="Search online jobs by profession..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0F172A] border border-white/10"
          />

          {filteredProfessions.length > 0 && (
            <div className="absolute w-full bg-[#0F172A] border border-white/10 rounded-xl mt-1 max-h-60 overflow-y-auto z-50">
              {filteredProfessions.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSearch(p.name);
                    setFilteredProfessions([]);
                    setJobs((prevJobs) =>
                      prevJobs.filter(
                        (job) => job.profession.toLowerCase() === p.name.toLowerCase()
                      )
                    );
                  }}
                  className="p-3 hover:bg-[#1F2937] cursor-pointer"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= DISTANCE FILTER ================= */}
{selectedTab === "offline-jobs" && (
  <div className="flex gap-2 justify-center mb-4">
    {[1, 2, 5, 20].map((km) => (
      <button
        key={km}
        onClick={() => fetchOfflineJobsByDistance(km)}
        className="px-3 py-1 rounded-xl bg-[#6366F1] text-white hover:bg-[#4f46e5]"
      >
        {km} km
      </button>
    ))}
  </div>
)}

      {/* ======================= JOB LIST ======================= */}
      {["online-jobs", "offline-jobs", "my-job-posts"].includes(selectedTab) && (
        <div className="max-w-3xl mx-auto space-y-4">
          {jobs.length === 0 && (
            <p className="text-center text-white/60 py-10">
              {selectedTab === "online-jobs" && "No online jobs available"}
              {selectedTab === "offline-jobs" && "No offline jobs available"}
              {selectedTab === "my-job-posts" && "You haven't posted any jobs yet"}
            </p>
          )}

          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => {
                if (selectedTab === "online-jobs") {
                  navigate(`/onlinejob/${job._id}`);
                } else if (selectedTab === "offline-jobs") {
                  navigate(`/offlinejob/${job._id}`);
                } else {
                  navigate(`/job/${job._id}`);
                }
              }}
              className="cursor-pointer p-5 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-white/20"
            >
              <div className="flex items-center space-x-3 mb-3">
                {job.hirer?.profileImage ? (
                  <img
                   src={
  job.hirer.profileImage?.startsWith("http")
    ? job.hirer.profileImage
    : `${BASE_URL}${job.hirer.profileImage}`
}
                    alt={job.hirer.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: job.hirer?.avatarColor }}
                  >
                    {job.hirer?.avatarInitial}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {job.hirer?.firstName} {job.hirer?.lastName}
                  </p>
                  <p className="text-xs text-white/50">Job Poster</p>
                </div>
              </div>

              {/* Job Details */}
              <p className="text-white/50 text-sm font-semibold">
                Profession: {job.profession}
              </p>
              <p className="text-white/70 text-sm line-clamp-2 overflow-hidden break-words">
                Description: {job.description || "No description provided"}
              </p>
              {selectedTab === "online-jobs" && job.languages?.length > 0 && (
                <p className="text-white/50 text-sm font-semibold">
                  Language Required: {job.languages.join(" , ")}
                </p>
              )}
              <p className="text-yellow-400 font-semibold">
                Price: {formatPrice(job.price)}
              </p>
              {selectedTab === "offline-jobs" && job.location?.address && (
                <p className="text-white/50 text-sm mt-1">
                  Address: {job.location.address}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
