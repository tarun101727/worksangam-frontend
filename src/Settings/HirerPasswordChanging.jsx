import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

export default function HirerPasswordChanging(){

const [user,setUser] = useState(null);

const [method,setMethod] = useState("email");

/* EMAIL METHOD */
const [otp,setOtp] = useState("");
const [otpSent,setOtpSent] = useState(false);
const [otpVerified,setOtpVerified] = useState(false);

/* OLD PASSWORD METHOD */
const [oldPassword,setOldPassword] = useState("");
const [oldVerified,setOldVerified] = useState(false);

/* NEW PASSWORD */
const [newPassword,setNewPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");



/* =========================
   GET CURRENT USER
========================= */

useEffect(()=>{

axios.get(`${BASE_URL}/api/auth/get-current-user`,{
withCredentials:true
})
.then(res=>setUser(res.data.user))

},[])



/* =========================
   EMAIL METHOD
========================= */

const sendOtp = async()=>{

await axios.post(
`${BASE_URL}/api/auth/send-otp-forgot-password`,
{email:user.email}
)

setOtpSent(true)

}



const verifyOtp = async()=>{

await axios.post(
`${BASE_URL}/api/auth/verify-otp-forgot-password`,
{
email:user.email,
otp
}
)

setOtpVerified(true)

}



const updatePasswordWithOtp = async()=>{

if(newPassword !== confirmPassword){
alert("Passwords do not match")
return
}

await axios.post(
`${BASE_URL}/api/auth/reset-password`,
{
email:user.email,
otp,
newPassword
}
)

alert("Password updated successfully")

window.location.reload()

}



/* =========================
   OLD PASSWORD METHOD
========================= */

const checkOldPassword = async()=>{

try{

await axios.post(
`${BASE_URL}/api/auth/verify-old-password`,
{oldPassword},
{withCredentials:true}
)

setOldVerified(true)

}catch(err){

alert("Incorrect old password" , err )

}

}



const updatePasswordWithOld = async()=>{

if(newPassword !== confirmPassword){
alert("Passwords do not match")
return
}

await axios.post(
`${BASE_URL}/api/auth/change-password-old`,
{
oldPassword,
newPassword
},
{withCredentials:true}
)

alert("Password updated successfully")

window.location.reload()

}



/* =========================
   UI
========================= */

return(

<div className="min-h-screen flex items-center justify-center p-6">

<div className="w-full max-w-md text-white bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg">

<h2 className="text-xl font-semibold mb-5 text-center">
Change Password
</h2>



{/* METHOD SWITCH */}

<div className="flex bg-[#020617] rounded-lg mb-6 overflow-hidden">

<button
onClick={()=>setMethod("email")}
className={`flex-1 p-3 text-sm font-medium transition ${
method === "email"
? "bg-indigo-600"
: "hover:bg-[#111827]"
}`}
>
Email
</button>

<button
onClick={()=>setMethod("oldPassword")}
className={`flex-1 p-3 text-sm font-medium transition ${
method === "oldPassword"
? "bg-indigo-600"
: "hover:bg-[#111827]"
}`}
>
Old Password
</button>

</div>



{/* =========================
   EMAIL METHOD
========================= */}

{method === "email" && (

<>

<input
value={user?.email || ""}
readOnly
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>



{!otpSent && (

<button
onClick={sendOtp}
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg mb-4"
>
Send OTP
</button>

)}



{otpSent && !otpVerified && (

<>

<input
placeholder="Enter OTP"
value={otp}
onChange={(e)=>setOtp(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<button
onClick={verifyOtp}
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg mb-4"
>
Verify OTP
</button>

</>

)}



{otpVerified && (

<>

<input
type="password"
placeholder="New Password"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>

<button
onClick={updatePasswordWithOtp}
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg"
>
Update Password
</button>

</>

)}

</>

)}



{/* =========================
   OLD PASSWORD METHOD
========================= */}

{method === "oldPassword" && (

<>

<input
type="password"
placeholder="Old Password"
value={oldPassword}
onChange={(e)=>setOldPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>



{!oldVerified && (

<button
onClick={checkOldPassword}
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg mb-4"
>
Check Old Password
</button>

)}



{oldVerified && (

<>

<input
type="password"
placeholder="New Password"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>

<button
onClick={updatePasswordWithOld}
className="w-full bg-red-600 hover:bg-red-500 p-3 rounded-lg"
>
Update Password
</button>

</>

)}

</>

)}

</div>
</div>

)

}