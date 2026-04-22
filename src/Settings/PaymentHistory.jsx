import axios from "axios";
import { BASE_URL } from "../config";
import { useEffect, useState } from "react";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/payment/my-payments`,
        { withCredentials: true }
      );

      setPayments(res.data.payments || []);
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
    const matchesSearch =
      p.transactionId?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL" || p.status === filter;

    return matchesSearch && matchesFilter;
  });

  // 📄 PAGINATION
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // 📊 SUMMARY
  const totalSpent = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalCredits = payments.reduce((acc, p) => acc + p.credits, 0);
  const successCount = payments.filter(p => p.status === "SUCCESS").length;

  const statusStyles = {
    SUCCESS: "bg-green-500/20 text-green-400",
    FAILED: "bg-red-500/20 text-red-400",
    PENDING: "bg-yellow-500/20 text-yellow-400",
  };

  // 🧱 SKELETON LOADER
  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white/10 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Payment History
      </h2>

      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-sm text-white/60">Total Spent</p>
          <h3 className="text-xl font-bold">₹{totalSpent}</h3>
        </div>

        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-sm text-white/60">Credits Bought</p>
          <h3 className="text-xl font-bold">{totalCredits}</h3>
        </div>

        <div className="bg-white/5 p-4 rounded-xl">
          <p className="text-sm text-white/60">Successful</p>
          <h3 className="text-xl font-bold">{successCount}</h3>
        </div>
      </div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-white/10 outline-none"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 rounded bg-white/10"
        >
          <option value="ALL">All</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* ❌ EMPTY STATE */}
      {filteredPayments.length === 0 ? (
        <div className="text-center text-white/60 mt-10">
          <p className="text-lg">No Payments Found</p>
          <p className="text-sm">Try adjusting filters or search</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {paginatedPayments.map((p) => (
            <div
              key={p._id}
              className="bg-white/5 hover:bg-white/10 transition border border-white/10 p-4 rounded-xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    ₹{p.amount} → {p.credits} Credits
                  </p>

                  <p className="text-sm text-white/60">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>

                  <p className="text-xs text-white/50">
                    Txn ID: {p.transactionId || "N/A"}
                  </p>

                  <p className="text-xs text-white/50">
                    Method: {p.method || "UPI"}
                  </p>
                </div>

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

      {/* 📄 PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-white/60">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* 🔐 TRUST TEXT */}
      <p className="text-xs text-white/40 text-center mt-10">
        🔒 Secure payments powered by Cashfree
      </p>
    </div>
  );
};

export default PaymentHistory;
