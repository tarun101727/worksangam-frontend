import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Settings() {

const [user,setUser] = useState(null);
const navigate = useNavigate();

useEffect(()=>{
  axios.get(`${BASE_URL}/api/auth/get-current-user`,{
    withCredentials:true
  })
  .then(res=>{
    setUser(res.data.user);
  })
  .catch(()=>{});
},[]);

if(!user) return null;

return(
<div className="min-h-screen text-white px-4 py-6">

<h1 className="text-2xl font-bold mb-6">Settings</h1>

<div className="space-y-4">
<button
onClick={()=>navigate("/buy-credits")}
className="w-full text-left p-4 bg-green-900/30 rounded-xl border border-green-500/20"
>
Buy Credits 💳
</button>
<button
onClick={()=>navigate("/settings/account")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
Account Information
</button>

<button
onClick={()=>navigate("/settings/Email")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
Change Email Address
</button>

<button
onClick={()=>navigate("/settings/Password")}
className="w-full text-left p-4 bg-[#111827] rounded-xl border border-white/10"
>
Change Password
</button>


<button
onClick={()=>navigate("/settings/logout")}
className="w-full text-left p-4 bg-yellow-900/30 rounded-xl border border-yellow-500/20"
>
Logout
</button>

<button
onClick={()=>navigate("/settings/delete")}
className="w-full text-left p-4 bg-red-900/30 rounded-xl border border-red-500/20"
>
Delete Account
</button>

</div>

</div>
);
}
