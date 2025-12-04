// src/components/MoveDetailsModal.jsx
import React, { useState } from "react";
import { ChevronRight, Search, User, Phone, Mail, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router-dom";

const MoveDetailsModal = ({ isOpen, onClose, onSubmit, companyCount = 0 }) => {
  const { login } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }
    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!form.password.trim()) {
      toast.error("Please enter your password.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // 🔥 Login API
    const result = await login(form.email, form.password);

    if (!result.success) {
      toast.error(result.message || "Invalid credentials");
      return;
    }

    // Store "extra details" locally for later pages
    const extra = {
      name: form.name,
      phone: form.phone,
      email: form.email
    };
    localStorage.setItem("moveUserDetails", JSON.stringify(extra));

    toast.success("Logged in successfully!");

    onSubmit?.(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-[90%] max-w-md sm:max-w-lg">

        {/* Decorative Layers */}
        <div className="absolute top-3 left-1 w-full h-[73vh] sm:h-[75vh] bg-white rounded-3xl shadow-md -rotate-3" />
        <div className="absolute top-1 left-1 w-full h-[73vh] sm:h-[75vh] bg-white rounded-3xl shadow-md rotate-3" />

        {/* Floating Count Badge */}
        <div className="absolute -top-6 right-5 z-20 flex flex-col items-center justify-center bg-pink-600 text-white rounded-full w-13 h-13 shadow-xl border-4 border-white">
          <span className="text-[15px] font-bold leading-none">{companyCount}</span>
          <span className="text-[9px] mt-0.5">Results</span>
        </div>

        {/* Modal Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 h-[73vh] sm:h-[75vh] overflow-y-auto z-10">

          <div className="flex items-center justify-center mb-3 mt-4 text-pink-600 font-semibold text-[11px] sm:text-[14px]">
            <Search size={15} className="mr-2 sm:w-4 sm:h-4" />
            <span>
              We found {companyCount} transport providers for your move
            </span>
          </div>

          <h2 className="text-[12px] sm:text-[15px] font-semibold text-gray-800 mb-1 text-center">
            To view your moving quotes,
          </h2>
          <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
            please login using your details below:
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* NAME */}
              <div className="flex flex-col">
                <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <User size={13} className="text-pink-600" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Complete Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              {/* PHONE */}
              <div className="flex flex-col">
                <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone size={13} className="text-pink-600" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

            </div>

            {/* Email + Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* EMAIL */}
              <div className="flex flex-col">
                <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-pink-600" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col">
                <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Lock size={13} className="text-pink-600" /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              Login & View Results
              <ChevronRight size={15} className="sm:w-4 sm:h-4" />
            </button>
          </form>

          {/* REGISTER LINK */}
          <p className="text-[11px] text-gray-600 text-center mt-3">
            New user?{" "}
            <Link
              to="/register"
              className="text-pink-600 font-semibold hover:underline"
              onClick={onClose}
            >
              Create an account
            </Link>
          </p>
          <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
            We aim to redefine local and long-distance moving by making it transparent, customer-friendly, and supported by modern digital tools.
          </p>
          

        </div>
      </div>
    </div>
  );
};

export default MoveDetailsModal;



// import React, { useState } from "react";
// import { Calendar, ChevronRight, Search, User, Phone, Mail } from "lucide-react";
// import { toast } from "react-toastify";

// const MoveDetailsModal = ({ isOpen, onClose, onSubmit, companyCount = 0 }) => {
//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     moveDate: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!form.name.trim()) {
//       toast.error("Please enter your full name.");
//       return false;
//     }
//     if (!/^[0-9]{10}$/.test(form.phone)) {
//       toast.error("Please enter a valid 10-digit phone number.");
//       return false;
//     }
//     if (!/\S+@\S+\.\S+/.test(form.email)) {
//       toast.error("Please enter a valid email address.");
//       return false;
//     }
//     if (!form.moveDate) {
//       toast.error("Please select your moving date.");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     // Save locally for future book-service page
//     localStorage.setItem("moveUserDetails", JSON.stringify(form));

//     onSubmit?.(form);
//     toast.success("Form submitted successfully!");
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-50"
//       role="dialog"
//       aria-modal="true"
//     >
//       <div className="relative w-[90%] max-w-md sm:max-w-lg">

//         {/* Decorative Layers */}
//         <div className="absolute top-3 left-1 w-full h-[73vh] sm:h-[75vh] bg-white rounded-3xl shadow-md -rotate-3" />
//         <div className="absolute top-1 left-1 w-full h-[73vh] sm:h-[75vh] bg-white rounded-3xl shadow-md rotate-3" />

//         {/* Floating Count Badge */}
//         <div className="absolute -top-6 right-5 z-20 flex flex-col items-center justify-center bg-pink-600 text-white rounded-full w-13 h-13 shadow-xl border-4 border-white">
//           <span className="text-[15px] font-bold leading-none">{companyCount}</span>
//           <span className="text-[9px] mt-0.5">Results</span>
//         </div>

//         {/* Modal Card */}
//         <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 h-[73vh] sm:h-[75vh] overflow-y-auto z-10">

//           <div className="flex items-center justify-center mb-3 mt-4 text-pink-600 font-semibold text-[11px] sm:text-[14px]">
//             <Search size={15} className="mr-2 sm:w-4 sm:h-4" />
//             <span>
//               We found {companyCount} transport providers to quote for your move
//             </span>
//           </div>

//           <h2 className="text-[12px] sm:text-[15px] font-semibold text-gray-800 mb-1 text-center">
//             To see your results and receive further information,
//           </h2>
//           <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
//             please enter your details below:
//           </p>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="space-y-3">

//             {/* Name + Phone */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

//               {/* NAME */}
//               <div className="flex flex-col">
//                 <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                   <User size={13} className="text-pink-600" /> Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Complete Name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                   required
//                 />
//               </div>

//               {/* PHONE */}
//               <div className="flex flex-col">
//                 <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                   <Phone size={13} className="text-pink-600" /> Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   placeholder="Phone"
//                   value={form.phone}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                   required
//                 />
//               </div>

//             </div>

//             {/* Email + Date */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

//               {/* EMAIL */}
//               <div className="flex flex-col">
//                 <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                   <Mail size={13} className="text-pink-600" /> Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                   required
//                 />
//               </div>

//               {/* MOVING DATE */}
//               <div className="flex flex-col">
//                 <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                   <Calendar size={13} className="text-pink-600" /> Moving Date
//                 </label>

//                 <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px]">
//                   <input
//                     type="date"
//                     name="moveDate"
//                     value={form.moveDate}
//                     onChange={handleChange}
//                     className="w-full outline-none text-[12px] sm:text-[13px]"
//                     required
//                   />
//                 </div>
//               </div>

//             </div>

//             {/* SUBMIT */}
//             <button
//               type="submit"
//               className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
//             >
//               View Results <ChevronRight size={15} className="sm:w-4 sm:h-4" />
//             </button>

//           </form>

//           {/* FOOTER */}
//           <p className="text-[10px] sm:text-[11px] text-gray-400 mt-4 text-center leading-relaxed">
//             Your details help us show accurate quotes from trusted moving partners.
//             We never share your information with third parties.
//             Your move is safe, secure, and handled with care.
//             Our team ensures a smooth experience from start to finish.
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default MoveDetailsModal;
