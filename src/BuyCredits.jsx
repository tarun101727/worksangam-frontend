import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "./config";

export default function BuyCredits() {

const [amount,setAmount] = useState(100);

const handleUPI = () => {
  const upiId = "gaddamtarun157-1@okhdfcbank";

  const url = `upi://pay?pa=${upiId}&pn=YourApp&am=${amount}&cu=INR`;

  window.location.href = url;
};

const handleAddCredits = async () => {
  await axios.post(`${BASE_URL}/api/payment/add-credits`,
    { amount },
    { withCredentials:true }
  );

  alert("Credits Added!");
};

return(
<div className="p-6 text-white">

<h1 className="text-xl mb-4">Buy Credits</h1>

<select
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="p-2 bg-black border"
>
<option value={10}>₹10</option>
<option value={50}>₹50</option>
<option value={100}>₹100</option>
</select>

<div className="mt-4 space-y-2">

<button onClick={handleUPI} className="block w-full p-3 bg-blue-500 rounded">
Google Pay / PhonePe / Paytm
</button>

<button className="block w-full p-3 bg-yellow-500 rounded">
PayPal (coming next)
</button>

</div>

<button
onClick={handleAddCredits}
className="mt-4 w-full p-3 bg-green-600 rounded"
>
Confirm Payment
</button>

</div>
);
}