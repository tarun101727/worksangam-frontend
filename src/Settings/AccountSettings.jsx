import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import HirerAccountEdit from "./HirerAccountEdit";
import EmployeeAccountEdit from "./EmployeeAccountEdit";

export default function AccountSettings(){

const [user,setUser] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
  axios.get(`${BASE_URL}/api/auth/get-current-user`, {
    withCredentials: true
  })
  .then(res => {
    setUser(res.data.user);
  })
  .catch(() => {})
  .finally(() => {
    setLoading(false); // ✅ STOP LOADING
  });
}, []);

if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

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
