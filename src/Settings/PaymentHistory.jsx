import axios from "axios";
import { BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";



const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const { t } = useTranslation();



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

  // ✅ SUCCESS & FAILED SEPARATION (FIXED LOGIC)
  const successPayments = payments.filter((p) => p.status === "SUCCESS");
  const failedPayments = payments.filter((p) => p.status === "FAILED");

  // 📊 CORRECT SUMMARY
  const totalSpent = successPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCredits = successPayments.reduce(
    (acc, p) => acc + p.credits,
    0
  );

  const successCount = successPayments.length;
  const failedCount = failedPayments.length;

  const statusStyles = {
    SUCCESS: "bg-green-500/20 text-green-400",
    FAILED: "bg-red-500/20 text-red-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="min-h-screen px-4 py-10 text-white">

      {/* 🔥 HEADER */}
      <h2 className="text-3xl font-bold mb-6 text-center">
        {t("Payment History")}
      </h2>

      {/* 📊 SUMMARY CARDS */}
      <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-6">
        {/* TOTAL SPENT */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-white/60 text-sm">{t("Total Spent")}</p>
          <h3 className="text-xl font-bold">₹{totalSpent}</h3>
        </div>

        {/* CREDITS */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-white/60 text-sm">{t("Credits Bought")}</p>
          <h3 className="text-xl font-bold">{totalCredits}</h3>
        </div>

        {/* SUCCESS */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-white/60 text-sm">{t("Successful Payments")}</p>
          <h3 className="text-xl font-bold text-green-400">
            {successCount}
          </h3>
        </div>

        {/* ❌ FAILED */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-white/60 text-sm">{t("Failed Payments")}</p>
          <h3 className="text-xl font-bold text-red-400">
            {failedCount}
          </h3>
        </div>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-white/10 outline-none"
        />

        <div className="flex gap-2 flex-wrap">
  {[t("ALL"), t("SUCCESS"), t("FAILED"), t("PENDING")].map((type) => (
    <button
      key={type}
      onClick={() => setFilter(type)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition 
        ${
          filter === type
            ? "bg-blue-600 text-white shadow-md"
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
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white/10 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        // 📭 EMPTY
        <div className="text-center text-white/60 mt-20">
          <p className="text-lg font-semibold">{t("No Payments Found")}</p>
          <p className="text-sm">
            {t("Your transactions will appear here")}
          </p>
        </div>
      ) : (
        // 💳 LIST
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredPayments.map((p) => (
            <div
              key={p._id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  {/* 💰 */}
                  <p className="text-lg font-semibold">
                    ₹{p.amount} → {p.credits} {t("Credits")}
                  </p>

                  {/* 🕒 */}
                  <p className="text-sm text-white/60">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>

                  {/* 🔑 */}
                  <p className="text-xs text-white/40 mt-1">
                    {t("Order ID")}: {p.orderId}
                  </p>

                  {/* ❌ FAILED MESSAGE */}
                  {p.status === "FAILED" && (
                    <p className="text-xs text-red-400 mt-1">
                      {t("Payment failed. No credits added.")}
                    </p>
                  )}

                  {/* ⏳ PENDING */}
                  {p.status === "PENDING" && (
                    <p className="text-xs text-yellow-400 mt-1">
                      {t("Payment is pending confirmation...")}
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[p.status]}`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔐 TRUST */}
      <p className="text-xs text-white/40 text-center mt-10">
        🔒 {t("Secure payments powered by Cashfree")}
      </p>
    </div>
  );
};

export default PaymentHistory;
