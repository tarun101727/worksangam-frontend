
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASE_URL } from "./config";

export default function JobApplicationDetails() {
  const { notificationId } = useParams();
  const [data, setData] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/jobs/notifications/${notificationId}`, {
        withCredentials: true,
      })
      .then((res) => setData(res.data));
  }, [notificationId]);

  if (!data) return null;

  const notificationType = data.notification.type;
  const job = data.job;

  const accept = async () => {
    await axios.post(
      `${BASE_URL}/api/jobs/application/accept/${notificationId}`,
      {},
      { withCredentials: true }
    );
  };

  const reject = async () => {
    await axios.post(
      `${BASE_URL}/api/jobs/application/reject/${notificationId}`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">

      {/* ================= USER INFO ================= */}
      <div className="flex items-center gap-4 mb-8">

        {/* JOB APPLICATION (HIRER VIEW) */}
        {notificationType === "job_application" && (
          <>
            {data.employee.profileImage ? (
              <img
                src={`${BASE_URL}${data.employee.profileImage}`}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: data.employee.avatarColor }}
              >
                {data.employee.avatarInitial}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">
                {data.employee.firstName} {data.employee.lastName}
              </h2>
              <p className="text-white/70 text-sm">
                Profession: {data.employee.profession}
              </p>
            </div>
          </>
        )}

        {/* APPLICATION ACCEPTED (EMPLOYEE VIEW) */}
        {notificationType === "application_accepted" && (
          <>
            {job.hirer?.profileImage ? (
              <img
                src={`${BASE_URL}${job.hirer.profileImage}`}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: job.hirer?.avatarColor }}
              >
                {job.hirer?.avatarInitial}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">
                {job.hirer?.firstName} {job.hirer?.lastName}
              </h2>

              <p className="text-green-400 text-sm font-semibold">
                You are accepted for this job
              </p>
            </div>
          </>
        )}

        {notificationType === "application_rejected" && (
  <>
    {job.hirer?.profileImage ? (
      <img
        src={`${BASE_URL}${job.hirer.profileImage}`}
        className="w-14 h-14 rounded-full"
      />
    ) : (
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: job.hirer?.avatarColor }}
      >
        {job.hirer?.avatarInitial}
      </div>
    )}

    <div>
      <h2 className="text-lg font-semibold">
        {job.hirer?.firstName} {job.hirer?.lastName}
      </h2>

      <p className="text-red-400 text-sm font-semibold">
        Your application was not selected for this job
      </p>
    </div>
  </>
)}

      </div>

      {/* ================= JOB DETAILS ================= */}
      <div className="bg-white/5 rounded-2xl p-6 space-y-8">

        {/* PROFESSION */}
        <h1 className="text-2xl font-bold">
          Profession :
          <span className="text-indigo-400 ml-2">
            {job.profession}
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="text-white/70">{job.description}</p>

        {/* TIME */}
        {job.preferredTime && (
          <p className="text-white/60">
            <span className="font-semibold text-white/80">
              Preferred Time :
            </span>{" "}
            {job.preferredTime.type === "asap" && "As soon as possible"}
            {job.preferredTime.type === "today" && "Today"}
            {job.preferredTime.type === "custom" && (
              <>
                {new Date(job.preferredTime.from).toLocaleString()} —{" "}
                {new Date(job.preferredTime.to).toLocaleString()}
              </>
            )}
          </p>
        )}

        {/* MEDIA */}
        {job.media?.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-white/80 mb-3">
              Images
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {job.media.map((m, i) =>
                m.type === "image" ? (
                  <img
                    key={i}
                    src={`${BASE_URL}${m.url}`}
                    alt="job"
                    onClick={() => setSelectedMedia(m)}
                    className="h-28 w-full object-cover rounded-xl cursor-pointer hover:opacity-80"
                  />
                ) : (
                  <video
                    key={i}
                    onClick={() => setSelectedMedia(m)}
                    className="h-28 w-full object-cover rounded-xl cursor-pointer"
                  >
                    <source src={`${BASE_URL}${m.url}`} />
                  </video>
                )
              )}
            </div>
          </div>
        )}

        {/* WARNINGS */}
        {job.safetyWarnings && (
          <div className="bg-red-500/10 rounded-xl p-4">
            <p className="font-semibold text-red-400 mb-2">
              Warnings
            </p>

            <div className="text-sm text-red-300 space-y-1">
              {job.safetyWarnings.children && <p>• Children present</p>}
              {job.safetyWarnings.elderly && <p>• Elderly present</p>}
              {job.safetyWarnings.pets && <p>• Pets present</p>}
              {job.safetyWarnings.safetyConcerns && (
                <p>• Safety concerns</p>
              )}
            </div>
          </div>
        )}

        {/* PRICE */}
        {job.price && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-xl font-bold text-yellow-400">
              {job.price.type === "fixed" &&
                `${job.price.currency} ${job.price.value}`}
              {job.price.type === "hourly" &&
                `${job.price.currency} ${job.price.value}/hr`}
              {job.price.type === "negotiable" &&
                `${job.price.currency} ${job.price.min} – ${job.price.max}`}
              {job.price.type === "inspect_quote" && "Inspect & Quote"}
            </p>
          </div>
        )}

        {/* ADDRESS */}
        {job.addressDetails && (
          <p className="text-white/60">
            <span className="font-semibold text-white/80">
              Address / Landmark :
            </span>{" "}
            {job.addressDetails}
          </p>
        )}

        {/* LOCATION */}
        {job.location?.address && (
          <p className="text-white/60">
            <span className="font-semibold text-white/80">
              Location :
            </span>{" "}
            {job.location.address}
          </p>
        )}

      </div>

      {/* ================= ACTION BUTTONS (HIRER ONLY) ================= */}
      {notificationType === "job_application" && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={accept}
            className="bg-green-500 px-6 py-2 rounded-xl"
          >
            Accept
          </button>

          <button
            onClick={reject}
            className="bg-red-500 px-6 py-2 rounded-xl"
          >
            Reject
          </button>
        </div>
      )}

      {/* ================= MEDIA VIEWER ================= */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white text-2xl"
            >
              ✕
            </button>

            {selectedMedia.type === "image" ? (
              <img
                src={`${BASE_URL}${selectedMedia.url}`}
                className="max-h-[90vh] rounded-lg"
              />
            ) : (
              <video controls className="max-h-[90vh] rounded-lg">
                <source src={`${BASE_URL}${selectedMedia.url}`} />
              </video>
            )}
          </div>
        </div>
      )}

    </div>
  );
}