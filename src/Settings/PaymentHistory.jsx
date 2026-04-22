import axios from "axios";
import { BASE_URL } from "../config";
import { useEffect, useState } from "react";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/payment/my-payments`,
        { withCredentials: true }
      );

      setPayments(res.data.payments);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // 🔍 FILTER + SEARCH
  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.orderId?.toLowerCase().includes(search.toLowerCase());

    const matchFilter = filter === "ALL" || p.status === filter;

    return matchSearch && matchFilter;
  });

  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const failedPayments = payments.filter((p) => p.status === "FAILED");

  const totalSpent = successPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCredits = successPayments.reduce(
    (acc, p) => acc + p.credits,
    0
  );

  const successCount = successPayments.length;
  const failedCount = failedPayments.length;

  const statusStyles = {
    SUCCESS: "bg-green-500/20 text-green-400 border border-green-500/30",
    FAILED: "bg-red-500/20 text-red-400 border border-red-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  };

  return (
    <div className="min-h-screen px-4 py-10 text-white bg-gradient-to-b from-black via-[#0a0a0a] to-black">

      {/* 🔥 HEADER */}
      <h2 className="text-3xl font-bold mb-8 text-center tracking-wide">
        💳 Payment History
      </h2>

      {/* 📊 SUMMARY */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">

        {/* 💰 TOTAL */}
        <div className="bg-white/5 backdrop-blur p-5 rounded-2xl border border-white/10">
          <p className="text-white/60 text-sm">Total Spent</p>
          <h3 className="text-2xl font-bold mt-1">₹{totalSpent}</h3>
        </div>

        {/* ⭐ CREDITS (Highlighted) */}
        <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/20 p-5 rounded-2xl border border-blue-500/30 shadow-lg">
          <p className="text-white/70 text-sm">Credits Bought</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-400">
            {totalCredits}
          </h3>
        </div>

        {/* ✅ SUCCESS */}
        <div className="bg-white/5 backdrop-blur p-5 rounded-2xl border border-white/10">
          <p className="text-white/60 text-sm">Successful</p>
          <h3 className="text-2xl font-bold text-green-400 mt-1">
            {successCount}
          </h3>
        </div>

        {/* ❌ FAILED */}
        <div className="bg-white/5 backdrop-blur p-5 rounded-2xl border border-white/10">
          <p className="text-white/60 text-sm">Failed</p>
          <h3 className="text-2xl font-bold text-red-400 mt-1">
            {failedCount}
          </h3>
        </div>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="🔍 Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-white/10 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2 flex-wrap">
          {["ALL", "SUCCESS", "FAILED", "PENDING"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition 
              ${
                filter === type
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ⚡ LOADING */}
      {loading ? (
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white/10 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center text-white/60 mt-20">
          <p className="text-lg font-semibold">No Payments Found</p>
          <p className="text-sm">Your transactions will appear here</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-4">

          {filteredPayments.map((p) => (
            <div
              key={p._id}
              className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >

              {/* LEFT */}
              <div className="space-y-1">

                <p className="text-lg font-semibold">
                  ₹{p.amount}
                  <span className="text-white/50 mx-2">→</span>
                  <span className="text-blue-400">
                    {p.credits} Credits
                  </span>
                </p>

                <p className="text-sm text-white/60">
                  {new Date(p.createdAt).toLocaleString()}
                </p>

                <p className="text-xs text-white/40">
                  Order ID: {p.orderId}
                </p>

                {p.status === "FAILED" && (
                  <p className="text-xs text-red-400">
                    ❌ Payment failed. No credits added.
                  </p>
                )}

                {p.status === "PENDING" && (
                  <p className="text-xs text-yellow-400">
                    ⏳ Waiting for confirmation...
                  </p>
                )}
              </div>

              {/* RIGHT STATUS */}
              <div className="flex items-center justify-between md:justify-end gap-3">

                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusStyles[p.status]}`}
                >
                  {p.status}
                </span>

              </div>
            </div>
          ))}

        </div>
      )}

      {/* 🔐 TRUST */}
      <p className="text-xs text-white/40 text-center mt-12">
        🔒 Secure payments powered by Cashfree
      </p>
    </div>
  );
};

export default PaymentHistory;
