import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import HirerAccountEdit from "./HirerAccountEdit";
import EmployeeAccountEdit from "./EmployeeAccountEdit";

export default function AccountSettings(){

const [user,setUser] = useState(null);

useEffect(()=>{
axios.get(`${BASE_URL}/api/auth/get-current-user`,{
withCredentials:true
}).then(res=>{
setUser(res.data.user);
});
},[]);

if(!user) return null;

return(
<div className="min-h-screen px-4 py-6 text-white">

{user.role === "hirer" && (
<HirerAccountEdit user={user}/>
)}

{user.role === "employee" && (
<EmployeeAccountEdit user={user}/>
)}

</div>
);
}