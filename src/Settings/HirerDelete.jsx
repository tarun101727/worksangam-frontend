import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HirerDelete(){

const navigate = useNavigate();

const [reason,setReason] = useState("");
const [description,setDescription] = useState("");
const [loading,setLoading] = useState(false);
const { t } = useTranslation();

const deleteAccount = async () => {

if(!reason){
alert("Please select a reason");
return;
}

if(!window.confirm("Are you sure you want to permanently delete your account?")){
return;
}

try{

setLoading(true);

await axios.delete(`${BASE_URL}/api/auth/delete-account`,{
withCredentials:true,
data:{
reason,
description
}
});

alert("Account deleted");

navigate("/");

}catch(err){

alert(err?.response?.data?.msg || "Error deleting account");

}finally{
setLoading(false);
}

};

return(

<div className="min-h-screen text-white px-4 py-6 max-w-3xl mx-auto">

<h1 className="text-2xl font-bold mb-4 text-red-400">
{t("Delete Your Account")}
</h1>

<p className="text-gray-300 mb-6">
{t("deleted_description")}
</p>

<div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">

<h2 className="font-semibold mb-2">{t("Warning")}</h2>

<ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">

<li>{t("Your account will be permanently deleted.")}</li>

<li>{t("Your uploaded content and profile data will be removed.")}</li>

<li>{t("Your ratings and reviews will disappear.")}</li>

<li>{t("You cannot recover your account after deletion.")}</li>

<li>{t("You must create a new account to use the platform again.")}</li>

</ul>

</div>

<h2 className="font-semibold mb-2">{t("Why are you deleting your account?")}</h2>

<select
value={reason}
onChange={(e)=>setReason(e.target.value)}
className="w-full p-3 bg-[#111827] rounded-xl border border-white/10 mb-4"
>

<option value="">{t("Select reason")}</option>
<option value="privacy">{t("Privacy concerns")}</option>
<option value="not_useful">{t("Service not useful")}</option>
<option value="found_better">{t("Found better platform")}</option>
<option value="temporary_leave">{t("Temporary break")}</option>
<option value="technical_problem">{t("Technical problems")}</option>
<option value="other">{t("Other")}</option>

</select>

<textarea
placeholder={t("Optional feedback (helps us improve)")}
value={description}
onChange={(e)=>setDescription(e.target.value)}
className="w-full p-3 bg-[#111827] rounded-xl border border-white/10 mb-6 h-28"
/>

<button
onClick={deleteAccount}
disabled={loading}
className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-semibold"
>

{loading ? t("Deleting...") : t("Delete My Account")}

</button>

</div>

);
}
