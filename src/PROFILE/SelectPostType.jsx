// SelectPostType.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const SelectPostType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="max-w-md w-full space-y-6 rounded-2xl bg-slate-900/60 p-6 text-white shadow-xl backdrop-blur">
        <h3 className="text-2xl font-bold tracking-tight text-center">
          Select Post Type
        </h3>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/hirer/standard-post")}
            className="
              w-full rounded-xl py-3 font-semibold
              bg-gradient-to-r from-indigo-500 to-indigo-600
              shadow-lg shadow-indigo-500/30
              transition-all duration-200
              hover:from-indigo-600 hover:to-indigo-700
              hover:shadow-indigo-500/50
              active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            "
          >
            Standard Post
          </button>

          <button
            onClick={() => navigate("/hirer/urgent-post")}
            className="
              w-full rounded-xl py-3 font-semibold
              bg-gradient-to-r from-red-500 to-red-600
              shadow-lg shadow-red-500/30
              transition-all duration-200
              hover:from-red-600 hover:to-red-700
              hover:shadow-red-500/50
              active:scale-[0.98]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            "
          >
            🚨 Urgent Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPostType;