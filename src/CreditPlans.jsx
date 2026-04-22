import axios from "axios";
import { BASE_URL } from "./config";
import { useState, useEffect } from "react";

const plans = [
  {
    amount: 99,
    credits: 50,
    title: "Starter",
    desc: "Perfect for small hirers who want to quickly find online or nearby workers for basic tasks.",
    features: [
      "Post 10+ online or offline jobs",
      "Reach nearby workers within your area",
      "Basic visibility in job listings",
      "Suitable for one-time or small hiring needs",
      "Simple and quick hiring process",
    ],
  },
  {
    amount: 199,
    credits: 120,
    title: "Standard",
    popular: true,
    desc: "Best for regular hirers who frequently hire employees and want faster responses and better reach.",
    features: [
      "Post 25+ jobs (online & offline)",
      "Higher visibility to relevant workers",
      "Faster responses from employees",
      "Priority listing in worker feeds",
      "Ideal for daily or frequent hiring",
    ],
  },
  {
    amount: 499,
    credits: 350,
    title: "Premium",
    desc: "Designed for businesses and heavy hirers who need maximum reach, urgent hiring, and top priority.",
    features: [
      "Post 70+ jobs with top priority",
      "Maximum reach across all workers",
      "Instant visibility to nearby & online employees",
      "Top placement in job listings",
      "Best for urgent and bulk hiring needs",
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

  // ✅ Optimized polling (limited runs)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");

    if (!orderId) return;

    let count = 0;

    const interval = setInterval(async () => {
      count++;

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/user/credits`, {
          withCredentials: true,
        });

        setCredits(res.data.credits);

        // stop polling after success OR 30 sec
        if (res.data.credits > 0 || count >= 10) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
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
    <div className="min-h-screen overflow-y-auto flex flex-col items-center px-4 py-10 text-white">
      
      {/* Title */}
      <h2 className="text-3xl font-bold mb-2">Buy Credits</h2>
      <p className="text-white/60 mb-6 text-center">
        Use credits to post jobs and reach workers instantly 🚀
      </p>

      {/* Credits Card */}
      <div className="mb-8 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl shadow-md">
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
              className={`relative p-6 rounded-2xl border transition-transform duration-300 hover:scale-105 
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
