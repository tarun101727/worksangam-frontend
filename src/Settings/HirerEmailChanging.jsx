import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

export default function HirerEmailChanging(){

const [user,setUser] = useState(null);

const [otp,setOtp] = useState("");
const [newEmail,setNewEmail] = useState("");
const [newEmailOtp,setNewEmailOtp] = useState("");

const [otpSent,setOtpSent] = useState(false);
const [verified,setVerified] = useState(false);
const [newEmailOtpSent,setNewEmailOtpSent] = useState(false);


/* GET USER */

useEffect(()=>{

axios.get(`${BASE_URL}/api/auth/get-current-user`,{
withCredentials:true
})
.then(res=>setUser(res.data.user))

},[])



/* SEND OTP CURRENT EMAIL */

const sendOtp = async()=>{

await axios.post(
`${BASE_URL}/api/auth/security/send-current-email-otp`,
{},
{withCredentials:true}
)

setOtpSent(true)

}



/* VERIFY CURRENT EMAIL */

const verifyOtp = async()=>{

await axios.post(
`${BASE_URL}/api/auth/security/verify-current-email-otp`,
{otp},
{withCredentials:true}
)

setVerified(true)

}



/* SEND OTP NEW EMAIL */

const sendNewEmailOtp = async()=>{

await axios.post(
`${BASE_URL}/api/auth/security/send-new-email-otp`,
{newEmail},
{withCredentials:true}
)

setNewEmailOtpSent(true)

}



/* CONFIRM EMAIL CHANGE */

const confirmEmailChange = async()=>{

await axios.post(
`${BASE_URL}/api/auth/security/change-email`,
{
newEmail,
otp:newEmailOtp
},
{withCredentials:true}
)

alert("Email updated successfully")

window.location.reload()

}



return(

<div className="min-h-screen flex items-center justify-center p-6">

<div className="w-full max-w-md text-white bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-lg">

<h2 className="text-xl font-semibold mb-5">
Change Email
</h2>


{/* STEP 1 */}

{!verified && (

<>

<input
value={user?.email || ""}
readOnly
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-4"
/>


{!otpSent && (

<button
onClick={sendOtp}
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg"
>
Send OTP
</button>

)}


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
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg"
>
Verify OTP
</button>

</>

)}

</>

)}



{/* STEP 2 */}

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
className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-lg"
>
Send OTP to New Email
</button>

</>

)}



{/* STEP 3 */}

{newEmailOtpSent && (

<>

<input
placeholder="Enter OTP from new email"
value={newEmailOtp}
onChange={(e)=>setNewEmailOtp(e.target.value)}
className="w-full p-3 rounded-lg bg-[#020617] border border-white/10 mb-3"
/>

<button
onClick={confirmEmailChange}
className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg"
>
Verify & Update Email
</button>

</>

)}

</div>
</div>

)

}