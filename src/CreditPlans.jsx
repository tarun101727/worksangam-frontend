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

  // Fetch on component mount
  useEffect(() => {
    // Wrap async call inside effect
    const loadCredits = async () => {
      await fetchCredits();
    };
    loadCredits();
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

        if (res.data.credits > 0) clearInterval(interval); // stop polling once credits update
      } catch (err) {
        console.error("Failed to fetch credits after payment:", err);
      }
    }, 3000); // check every 3 seconds
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
    <div style={{ padding: "20px" }}>
      <h2>Buy Credits</h2>
      <p>Total Credits: {credits}</p>

      <div style={{ display: "flex", gap: "20px" }}>
        {plans.map((plan) => (
          <div
            key={plan.amount}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px",
              width: "150px",
            }}
          >
            <h3>₹{plan.amount}</h3>
            <p>{plan.credits} Credits</p>

            <button onClick={() => handleBuy(plan.amount)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditPlans;
