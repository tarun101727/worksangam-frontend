import { useState, Fragment, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config";
import { Listbox, Transition } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n.js";


const GENDERS = ["Male", "Female", "Other"];
export default function HirerAccountEdit({ user }) {
  const { t } = useTranslation();
const navigate = useNavigate();
const location = useLocation();
/* =======================
   FORM STATE
======================= */
const [form,setForm] = useState({
firstName:"",
lastName:"",
age:"",
gender:"",
genderLabel:""
});

/* =======================
   IMAGE STATE
======================= */
const [image,setImage] = useState(null);
const [preview,setPreview] = useState("");

const [loading,setLoading] = useState(false);

/* =======================
   LOAD USER DATA
======================= */
useEffect(()=>{

if(!user) return;

/* keep existing form values if already filled */
setForm(prev => ({
firstName: prev.firstName || user.firstName || "",
lastName: prev.lastName || user.lastName || "",
age: prev.age || user.age || "",
gender: prev.gender || user.gender || "",
genderLabel: prev.genderLabel || user.genderLabel || user.gender || ""
}));

if(!preview && user.profileImage){
setPreview(
  user.profileImage.startsWith("http")
    ? user.profileImage
    : `${BASE_URL}${user.profileImage}`
);
}

},[user]);


/* =======================
   RECEIVE IMAGE FROM PREVIEW PAGE
======================= */
useEffect(()=>{

if(location.state?.profileImage && location.state?.file){

setPreview(location.state.profileImage);
setImage(location.state.file);

/* remove router state so it doesn't trigger again */
navigate(location.pathname,{
replace:true,
state:{}
});

}

},[location.state,navigate,location.pathname]);

let latestRequest = "";

const transliterate = async (value, field) => {
  const currentLang = i18n.language || "en";

  latestRequest = value;

  const words = value.split(" ");
  const lastWord = words[words.length - 1];

  if (!lastWord) return;

  try {
    const res = await fetch(
      `https://inputtools.google.com/request?text=${lastWord}&itc=${currentLang}-t-i0-und&num=5`
    );

    const data = await res.json();

    if (latestRequest !== value) return;

    if (data[0] === "SUCCESS") {
      const suggestions = data[1][0][1];
      const bestMatch = suggestions[0];

      words[words.length - 1] = bestMatch;

      setForm((prev) => ({
        ...prev,
        [field]: words.join(" "),
      }));
    }
  } catch (err) {
    console.error(err);
  }
};

let timer;

const handleChange = (value, field) => {
  const currentLang = i18n.language || "en";

  // show typing instantly
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  if (!["te", "hi", "ta", "kn"].includes(currentLang)) return;

  clearTimeout(timer);

  const words = value.split(" ");
  const lastWord = words[words.length - 1];

  // SPACE pressed → instant transliteration
  if (value.endsWith(" ") && lastWord.length >= 3) {
    transliterate(value.trim(), field);
    return;
  }

  // user stopped typing
  timer = setTimeout(() => {
    if (lastWord.length >= 3) {
      transliterate(value, field);
    }
  }, 1000);
};

/* =======================
   INPUT STYLE
======================= */
const inputBase =
"w-full px-4 py-3 rounded-xl bg-[#111827] text-white " +
"border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50";

const buttonPrimary =
"w-full py-3 rounded-xl font-semibold text-white bg-[#6366F1] disabled:opacity-50";


/* =======================
   SAVE PROFILE
======================= */
const save = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    /* only send changed fields */
    if (form.firstName !== user.firstName) {
      formData.append("firstName", form.firstName.trim());
    }
    if (form.lastName !== user.lastName) {
      formData.append("lastName", form.lastName.trim());
    }
    if (Number(form.age) !== Number(user.age)) {
      formData.append("age", Number(form.age));
    }
    // ✅ send gender separately
if (form.gender !== user.gender) {
  formData.append("gender", form.gender);
}

// ✅ send genderLabel separately
if (form.genderLabel !== user.genderLabel) {
  formData.append("genderLabel", form.genderLabel);
}
    /* image upload only if changed */
    if (image) {
      formData.append("profileImage", image);
    }

    await axios.put(
      `${BASE_URL}/api/auth/update-hirer-account`,
      formData,
      { withCredentials: true }
    );

    alert("Profile updated");

    // Navigate to profile page after successful save
    navigate(`/profile/${user._id}`);

  } catch (err) {
    console.error(err);
    alert("Update failed");
  } finally {
    setLoading(false);
  }
};


return(

<div className="min-h-screen flex items-start md:items-center justify-center px-4 pt-6 md:pt-0">

<div
className="
w-full max-w-md
p-6 md:p-8
bg-transparent md:bg-[#0F172A]/90
border-none md:border md:border-white/10
rounded-none md:rounded-3xl
"
>

<h2 className="text-3xl font-bold text-center text-white mb-6">
{t("Edit Profile")}
</h2>


{/* PROFILE IMAGE */}
<div className="flex flex-col items-center mb-6">

<div
onClick={()=>navigate("/profile-image/hirer-edit")}
className="
w-24 h-24 rounded-full
p-[3px]
bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500
cursor-pointer
"
>

<div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">

{preview ? (

<img
src={preview}
alt="Profile"
className="w-full h-full object-cover rounded-full"
/>

):( 

<span className="text-white/60 text-sm">
{t("Add Photo")}
</span>

)}

</div>

</div>

<p className="text-xs text-white/60 mt-2 text-center">
{t("Click on the image to change your profile image")}
</p>

</div>


{/* FIRST NAME */}
<input
  placeholder={t("First Name")}
  value={form.firstName}
  onChange={(e) => handleChange(e.target.value, "firstName")}
  className={inputBase}
/>


{/* LAST NAME */}
<input
  placeholder={t("Last Name")}
  value={form.lastName}
  onChange={(e) => handleChange(e.target.value, "lastName")}
  className={`${inputBase} mt-4`}
/>


{/* AGE */}
<input
type="number"
min="18"
max="100"
placeholder={t("Age")}
value={form.age}
onChange={(e)=>setForm({...form,age:e.target.value})}
className={`${inputBase} mt-4`}
onWheel={(e)=>e.target.blur()}
/>


{/* GENDER */}
<Listbox
value={form.gender}
onChange={(v)=>{
  setForm({
    ...form,
    gender: v,              // English
    genderLabel: t(v),      // Translated
  });
}}
>

{({open})=>(

<div
className={`relative w-full ${open ? "md:mb-36":"md:mb-0"}`}
>

<Listbox.Button className={`${inputBase} mt-4 text-left`}>
 {form.genderLabel || t("Select Gender")}
</Listbox.Button>

<Transition as={Fragment}>

<Listbox.Options
className="
w-full
mt-2 bg-[#111827]
rounded-xl border border-white/10
static md:absolute z-10
"
>

{GENDERS.map((g) => (
  <Listbox.Option
    key={g}
    value={g}
    className="px-4 py-2 cursor-pointer hover:bg-[#6366F1]/20"
  >
    {t(g)}
  </Listbox.Option>
))}

</Listbox.Options>

</Transition>

</div>

)}

</Listbox>


<button
onClick={save}
disabled={loading}
className={`${buttonPrimary} mt-6`}
>

{loading ? t("Saving...") : t("Save Changes")}

</button>

</div>

</div>

);
}
