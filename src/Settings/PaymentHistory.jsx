import axios from "axios";
import { BASE_URL } from "../config";
import { useEffect, useState } from "react";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/payment/my-payments`,
        { withCredentials: true }
      );

      setPayments(res.data.payments);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Payment History
      </h2>

      {payments.length === 0 ? (
        <p className="text-center text-white/60">
          No transactions yet
        </p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {payments.map((p) => (
            <div
              key={p._id}
              className="bg-white/5 border border-white/10 p-4 rounded-xl"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    ₹{p.amount} → {p.credits} Credits
                  </p>

                  <p className="text-sm text-white/60">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>

                  <p className="text-sm text-white/50">
                    Method: {p.paymentMethod || "N/A"}
                  </p>
                </div>

                <div>
                  {p.status === "SUCCESS" && (
                    <span className="text-green-400 font-semibold">
                      SUCCESS
                    </span>
                  )}

                  {p.status === "FAILED" && (
                    <span className="text-red-400 font-semibold">
                      FAILED
                    </span>
                  )}

                  {p.status === "PENDING" && (
                    <span className="text-yellow-400 font-semibold">
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
