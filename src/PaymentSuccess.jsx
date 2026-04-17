// PaymentSuccess.jsx
import { useEffect } from "react";

const PaymentSuccess = () => {

  useEffect(() => {
    // OPTIONAL: verify order again
    console.log("Payment completed");
  }, []);

  return (
    <div>
      <h2>✅ Payment Successful</h2>
      <p>Credits will be added shortly.</p>
    </div>
  );
};

export default PaymentSuccess;