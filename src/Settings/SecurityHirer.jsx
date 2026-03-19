
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

export default function SecurityHirer() {

const [user,setUser] = useState(null);

const [otp,setOtp] = useState("");
const [newEmail,setNewEmail] = useState("");
const [newEmailOtp,setNewEmailOtp] = useState("");

const [otpSent,setOtpSent] = useState(false);
const [verified,setVerified] = useState(false);
const [newEmailOtpSent,setNewEmailOtpSent] = useState(false);

const [oldPassword,setOldPassword] = useState("");
const [newPassword,setNewPassword] = useState("");

/* =========================
   GET CURRENT USER
========================= */

useEffect(()=>{

axios.get(`${BASE_URL}/api/auth/get-current-user`,{
withCredentials:true
})
.then(res=>{
setUser(res.data.user)
})

},[])



/* =========================
   SEND OTP CURRENT EMAIL
========================= */

const sendOtp = async ()=>{

await axios.post(
`${BASE_URL}/api/auth/security/send-current-email-otp`,
{},
{withCredentials:true}
)

setOtpSent(true)

}



/* =========================
   VERIFY CURRENT EMAIL OTP
========================= */

const verifyOtp = async ()=>{

await axios.post(
`${BASE_URL}/api/auth/security/verify-current-email-otp`,
{otp},
{withCredentials:true}
)

setVerified(true)

}



/* =========================
   SEND OTP NEW EMAIL
========================= */

const sendNewEmailOtp = async ()=>{

await axios.post(
`${BASE_URL}/api/auth/security/send-new-email-otp`,
{newEmail},
{withCredentials:true}
)

setNewEmailOtpSent(true)

}



/* =========================
   CONFIRM EMAIL CHANGE
========================= */

const confirmEmailChange = async ()=>{

await axios.post(
`${BASE_URL}/api/auth/security/change-email`,
{
newEmail,
otp:newEmailOtp
},
{withCredentials:true}
)

alert("Email updated successfully")

/* refresh page */
window.location.reload()

}



/* =========================
   CHANGE PASSWORD
========================= */

const changePassword = async ()=>{

await axios.post(
`${BASE_URL}/api/auth/reset-password`,
{
email:user.email,
otp,
newPassword
}
)

alert("Password changed")

}



return(

<div className="min-h-screen flex items-center justify-center p-6">

<div className="w-full max-w-md space-y-6 text-white">

<h2 className="text-2xl font-bold text-center">
Security Settings
</h2>



{/* =====================
   CHANGE EMAIL CARD
===================== */}

<div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg">

<h3 className="text-lg font-semibold mb-4">
Change Email
</h3>


{/* CURRENT EMAIL */}

{!verified && (

<>

<input
value={user?.email || ""}
readOnly
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>



{/* SEND OTP */}

{!otpSent && (

<button
onClick={sendOtp}
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg font-medium transition"
>
Send OTP
</button>

)}



{/* VERIFY OTP */}

{otpSent && (

<>

<input
placeholder="Enter OTP"
value={otp}
onChange={(e)=>setOtp(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<button
onClick={verifyOtp}
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg font-medium transition"
>
Verify OTP
</button>

</>

)}

</>

)}



{/* =====================
   NEW EMAIL INPUT
===================== */}

{verified && !newEmailOtpSent && (

<>

<input
placeholder="Enter new email"
value={newEmail}
onChange={(e)=>setNewEmail(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>

<button
onClick={sendNewEmailOtp}
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg font-medium transition"
>
Send OTP to New Email
</button>

</>

)}



{/* =====================
   VERIFY NEW EMAIL OTP
===================== */}

{newEmailOtpSent && (

<>

<input
placeholder="OTP from new email"
value={newEmailOtp}
onChange={(e)=>setNewEmailOtp(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<button
onClick={confirmEmailChange}
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg font-medium transition"
>
Verify & Update Email
</button>

</>

)}

</div>



{/* =====================
   CHANGE PASSWORD CARD
===================== */}

<div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg">

<h3 className="text-lg font-semibold mb-4">
Change Password
</h3>

<input
value={user?.email || ""}
readOnly
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<input
type="password"
placeholder="Old Password"
value={oldPassword}
onChange={(e)=>setOldPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<input
type="password"
placeholder="New Password"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>

<button
onClick={changePassword}
className="w-full bg-red-600 hover:bg-red-500 p-3 rounded-lg font-medium transition"
>
Change Password
</button>

</div>


</div>
</div>

)

}