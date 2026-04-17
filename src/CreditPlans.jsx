// CreditPlans.jsx
import axios from "axios";
import { BASE_URL } from "../config";


const plans = [
  { amount: 99, credits: 50 },
  { amount: 199, credits: 120 },
  { amount: 499, credits: 350 },
];

const CreditPlans = () => {

  const handleBuy = async (amount) => {
    try {
      const res = await axios.post(
  `${BASE_URL}/api/payment/create-order`, // ✅ FIXED
  { amount },
  { withCredentials: true }
);

      const sessionId = res.data.payment_session_id;

      // 🔥 OPEN CASHFREE CHECKOUT
      const cashfree = window.Cashfree({
        mode: "production", // change to "sandbox" for testing
      });

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

            <button onClick={() => handleBuy(plan.amount)}>
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreditPlans;
