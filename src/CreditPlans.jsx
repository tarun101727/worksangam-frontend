import axios from "axios";
import { BASE_URL } from "./config";
import { useState, useEffect } from "react";

const plans = [
  { amount: 99, credits: 50 },
  { amount: 199, credits: 120 },
  { amount: 499, credits: 350 },
];

const CreditPlans = () => {
  const [credits, setCredits] = useState(0);

  // ✅ Fetch current credits
  const fetchCredits = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/user/credits`, {
        withCredentials: true,
      });
      setCredits(res.data.credits);
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // ✅ Poll after payment redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (orderId) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`${BASE_URL}/api/auth/user/credits`, {
            withCredentials: true,
          });
          setCredits(res.data.credits);

          if (res.data.credits > 0) clearInterval(interval);
        } catch (err) {
          console.error("Failed to fetch credits after payment:", err);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleBuy = async (amount) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/payment/create-order`,
        { amount },
        { withCredentials: true }
      );

      const sessionId = res.data.payment_session_id;

      const cashfree = window.Cashfree({ mode: "production" });

      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      console.error(err);
      alert("Payment failed to start");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-4 text-gray-800">
        Buy Credits
      </h2>

      {/* Credits Display */}
      <div className="bg-white shadow-md rounded-xl px-6 py-3 mb-8">
        <p className="text-lg font-medium text-gray-700">
          Total Credits: <span className="text-blue-600 font-bold">{credits}</span>
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.amount}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              ₹{plan.amount}
            </h3>

            <p className="text-gray-600 mb-4">
              {plan.credits} Credits
            </p>

            <button
              onClick={() => handleBuy(plan.amount)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 w-full"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditPlans;
