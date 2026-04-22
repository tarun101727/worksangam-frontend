import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";


const OnlineWorkerUrgentPosts = () => {
  const [post, setPost] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchHirerPost();
  }, []);

  const fetchHirerPost = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/online-workers/my-post`, { withCredentials: true });
    const fetchedPost = res.data.post;
    setPost(fetchedPost);

    // Pass languages from fetchedPost instead of post state
    fetchTopWorkers(fetchedPost.profession, 0, fetchedPost.languages);
  } catch (err) {
    console.error(err);
  }
};

  const fetchTopWorkers = async (profession, skipCount, languages = []) => {
  try {
    setLoading(true);

    const res = await axios.get(`${BASE_URL}/api/online-workers/top-workers`, {
      params: { 
        profession,
        skip: skipCount,
        limit: skipCount === 0 ? 5 : 10,
        languages: languages.join(","), // pass as comma-separated string
      },
      withCredentials: true,
    });

    if (res.data.workers.length === 0) setHasMore(false);

    setWorkers((prev) => (skipCount === 0 ? res.data.workers : [...prev, ...res.data.workers]));
    setSkip(skipCount + res.data.workers.length);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const getImageUrl = (img) => {
  if (!img) return "/default-avatar.png";
  return img.startsWith("http") ? img : `${BASE_URL}${img}`;
};


  if (!post) return <p className="text-center mt-10 text-white">Loading your post...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {/* HIRER POST BLOCK */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-md space-y-3">
        {post.hirer && (
          <div className="flex items-center gap-4 mb-4">
            <img
  src={getImageUrl(post.hirer.profileImage)}
  alt={`${post.hirer.firstName} ${post.hirer.lastName}`}
  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
/>
            <p className="text-white font-medium">
              {post.hirer.firstName} {post.hirer.lastName}
            </p>
          </div>
        )}

        <h2 className="text-xl font-semibold text-white">Your Post</h2>
        <p><strong>Profession:</strong> {post.profession}</p>
        <p><strong>Description:</strong> {post.description}</p>
        <p>
          <strong>Price:</strong>{" "}
          {post.price?.type === "fixed" ? post.price.value : `${post.price?.min} - ${post.price?.max}`}{" "}
          {post.price?.currency || ""}
        </p>
        <p><strong>Languages:</strong> {post.languages.join(", ")}</p>
      </div>

      {/* TOP WORKERS BLOCK */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-md space-y-4">
        <h2 className="text-xl font-semibold text-white">Top Workers for "{post.profession}"</h2>

       {workers.map((w) => (
  <div
    key={w._id}
    className="flex items-center gap-4 p-3 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700"
  >
    {/* Worker Info - clickable */}
    <div
      className="flex items-center gap-4 flex-1"
      onClick={() => navigate(`/profile/${w._id}`)}
    >
      <img
  src={getImageUrl(w.profileImage)}
  alt={w.name}
  className="w-12 h-12 rounded-full object-cover"
/>
      <div>
        <p className="text-white font-medium">{w.name}</p>
        <p className="text-yellow-400 text-sm">{w.ratingAverage}⭐ ({w.ratingCount} reviews)</p>
      </div>
    </div>

    {/* Chat Button */}
    <button
      onClick={async (e) => {
        e.stopPropagation(); // Prevent navigating to profile when clicking chat
        try {
          const res = await axios.post(`${BASE_URL}/api/chat/create/${w._id}`, {}, { withCredentials: true });
          navigate(`/chat/${res.data._id}`);
        } catch (err) {
          console.error(err);
        }
      }}
      className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
    >
      Chat with {w.firstName}
    </button>
  </div>
))}


        {hasMore && (
          <button
            className="w-full py-2 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-500"
            onClick={() => fetchTopWorkers(post.profession, skip)}
            disabled={loading}
          >
            {loading ? "Loading..." : "View More Workers"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnlineWorkerUrgentPosts;
