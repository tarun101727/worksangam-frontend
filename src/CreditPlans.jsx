import axios from "axios";
import { BASE_URL } from "./config";
import { useState, useEffect } from "react";

const plans = [
  {
    amount: 99,
    credits: 50,
    title: "Starter",
    desc: "Perfect for trying out job posting",
    features: [
      "Post 10+ jobs",
      "Basic visibility",
      "Good for small hiring needs",
    ],
  },
  {
    amount: 199,
    credits: 120,
    title: "Standard",
    popular: true,
    desc: "Best for regular hiring",
    features: [
      "Post 25+ jobs",
      "Better reach to workers",
      "Priority visibility",
    ],
  },
  {
    amount: 499,
    credits: 350,
    title: "Premium",
    desc: "For heavy and urgent hiring",
    features: [
      "Post 70+ jobs",
      "Maximum reach",
      "Top priority listing",
    ],
  },
];

const CreditPlans = () => {
  const [credits, setCredits] = useState(0);

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white">
      
      {/* Title */}
      <h2 className="text-3xl font-bold mb-2">Buy Credits</h2>
      <p className="text-white/60 mb-6">
        Use credits to post jobs and reach workers instantly 🚀
      </p>

      {/* Credits Card */}
      <div className="mb-8 bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-lg">
        <p className="text-sm text-white/60">Your Balance</p>
        <h3 className="text-2xl font-semibold text-yellow-400">
          {credits} Credits
        </h3>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan) => {
          const perCredit = (plan.amount / plan.credits).toFixed(2);

          return (
            <div
              key={plan.amount}
              className={`relative p-6 rounded-2xl border backdrop-blur-xl transition hover:scale-105 
              ${
                plan.popular
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-semibold">
                  Most Popular
                </span>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold text-white/80 mb-1">
                {plan.title}
              </h3>

              {/* Price */}
              <h2 className="text-3xl font-bold mb-1">
                ₹{plan.amount}
              </h2>

              {/* Credits */}
              <p className="text-yellow-400 font-semibold mb-2">
                {plan.credits} Credits
              </p>

              {/* Per credit */}
              <p className="text-xs text-white/50 mb-3">
                ₹{perCredit} per credit
              </p>

              {/* Description */}
              <p className="text-sm text-white/60 mb-4">
                {plan.desc}
              </p>

              {/* Features */}
              <ul className="text-sm text-white/70 mb-5 space-y-1">
                {plan.features.map((f, i) => (
                  <li key={i}>✔ {f}</li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handleBuy(plan.amount)}
                className={`w-full py-2 rounded-lg font-semibold transition 
                ${
                  plan.popular
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                Buy Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreditPlans;
