import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProfileImageforHirerEdit = () => {

const fileRef = useRef();
const navigate = useNavigate();

const handleFile = (file)=>{

if(!file) return;

const url = URL.createObjectURL(file);

navigate("/profile-preview/hirer-edit",{
state:{profileImage:url,file}
});

};

const openCamera = ()=>{

fileRef.current.setAttribute("capture","environment");
fileRef.current.click();

};

return(

<div className="min-h-screen flex items-center justify-center px-4">

<div className="w-full max-w-sm p-8 rounded-3xl bg-[#0F172A]/90 border border-white/10 text-center">

<h2 className="text-2xl font-bold text-white mb-6">
Change Profile Photo
</h2>

<button
onClick={()=>fileRef.current.click()}
className="w-full py-3 rounded-xl font-semibold text-white bg-[#6366F1] mb-4"
>
Choose from Gallery
</button>

<button
onClick={openCamera}
className="w-full py-3 rounded-xl font-semibold text-white bg-[#111827] border border-white/10"
>
Open Camera
</button>

<input
ref={fileRef}
type="file"
accept="image/*"
hidden
onChange={(e)=>handleFile(e.target.files[0])}
/>

</div>

</div>

);

};

export default ProfileImageforHirerEdit;