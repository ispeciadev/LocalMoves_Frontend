// src/components/MoveDetailsModal.jsx
import React, { useState } from "react";
import { 
  ChevronRight, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ChevronDown,
  Building,
  UserPlus
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../stores/useAuthStore";
import axios from "axios";

const MoveDetailsModal = ({ isOpen, onClose, onSubmit, companyCount = 0 }) => {
  const { login, register } = useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(true); // Changed to true to show register first
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    pincode: "",
    city: "",
    state: "",
    userType: "user"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // OTP Sender
  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/method/localmoves.api.auth.send_otp",
        { phone: form.phone }
      );

      const api = res.data?.message;

      if (!api) {
        toast.error("Unexpected server error");
        return;
      }

      if (!api.success) {
        toast.error(api.message);
        return;
      }

      setOtpStep(true);
      toast.success("OTP sent to your phone!");

    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP.");
    }
  };

  // OTP Verify
  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }
    setIsVerified(true);
    toast.success("OTP verified!");
  };

  // Validation for login mode
  const validateLoginForm = () => {
    if (!form.email.trim()) {
      toast.error("Please enter your email address.");
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

  // Validation for register mode
  const validateRegisterForm = () => {
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
    if (!form.password.trim() || form.password.length < 6) {
      toast.error("Please enter a password with at least 6 characters.");
      return false;
    }
    // if (!form.pincode.trim() || form.pincode.length !== 6) {
    //   toast.error("Please enter a valid 6-digit pincode.");
    //   return false;
    // }
    // if (!form.city.trim()) {
    //   toast.error("Please enter your city.");
    //   return false;
    // }
    // if (!form.state.trim()) {
    //   toast.error("Please enter your state.");
    //   return false;
    // }
    if (!isVerified) {
      toast.error("Please verify your phone number with OTP.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const result = await login(form.email, form.password);

    if (!result.success) {
      toast.error(result.message || "Invalid credentials");
      return;
    }

    // Store "extra details" locally for later pages
    const extra = {
      name: form.name || "", // Might be empty in login mode
      phone: form.phone || "", // Might be empty in login mode
      email: form.email
    };
    localStorage.setItem("moveUserDetails", JSON.stringify(extra));

    toast.success("Logged in successfully!");

    onSubmit?.(form);
    onClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    const payload = {
      fullName: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      // pincode: form.pincode,
      // city: form.city,
      // state: form.state,
      // userType: form.userType,
      otp: otp
    };

    try {
      const result = await register(payload);

      if (result.success) {
        toast.success("Registration successful!");
        
        // Store details
        const extra = {
          name: form.name,
          phone: form.phone,
          email: form.email
        };
        localStorage.setItem("moveUserDetails", JSON.stringify(extra));

        onSubmit?.(form);
        onClose();
      } else {
        toast.error(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      password: "",
      pincode: "",
      city: "",
      state: "",
      userType: "user"
    });
    setOtp("");
    setOtpStep(false);
    setIsVerified(false);
    setShowPassword(false);
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

        {/* Floating Count Badge - Only show in login mode */}
        {!isRegisterMode && companyCount > 0 && (
          <div className="absolute -top-6 right-5 z-20 flex flex-col items-center justify-center bg-pink-600 text-white rounded-full w-13 h-13 shadow-xl border-4 border-white">
            <span className="text-[15px] font-bold leading-none">{companyCount}</span>
            <span className="text-[9px] mt-0.5">Results</span>
          </div>
        )}

        {/* Modal Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100 max-h-[85vh] overflow-y-auto z-10">

          {!isRegisterMode ? (
            <>
              {/* LOGIN MODE */}
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

              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-pink-600" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Lock size={13} className="text-pink-600" /> Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  Login & View Results
                  <ChevronRight size={15} className="sm:w-4 sm:h-4" />
                </button>
              </form>

              {/* Switch to Register */}
              <p className="text-[11px] text-gray-600 text-center mt-3">
                New user?{" "}
                <button
                  onClick={() => {
                    setIsRegisterMode(true);
                    resetForm();
                  }}
                  className="text-pink-600 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            </>
          ) : (
            <>
              {/* REGISTER MODE (DEFAULT) */}
              <div className="flex items-center justify-center mb-2 text-pink-600">
                <UserPlus size={20} />
              </div>
              
              <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-1 text-center">
                Create Your Account
              </h2>
              
              {companyCount > 0 && (
                <p className="text-[11px] sm:text-[12px] text-center text-pink-600 font-medium mb-2">
                  Register to view {companyCount} transport providers for your move
                </p>
              )}
              
              <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
                Join <span className="text-pink-600 font-semibold">Local Moves</span> to get started!
              </p>

              <form onSubmit={handleRegister} className="space-y-3">
                {/* Name */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-pink-600" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-pink-600" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Lock size={13} className="text-pink-600" /> Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={15} className="text-gray-500" />
                      ) : (
                        <Eye size={15} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone + OTP */}
                <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-pink-600" /> Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                      required
                    />
                    {!isVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpStep}
                        className={`px-3 py-2 rounded-lg text-[11px] sm:text-[12px] text-white ${
                          otpStep ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
                        }`}
                      >
                        {otpStep ? "Sent" : "Send OTP"}
                      </button>
                    ) : (
                      <span className="bg-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-[11px] sm:text-[12px]">
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                  
                  {otpStep && !isVerified && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 border rounded-lg text-pink-600 border-pink-500 hover:bg-pink-50 text-[11px] sm:text-[12px]"
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>

                {/* Pincode */}
                {/* <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-pink-600" /> Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div> */}

                {/* City */}
                {/* <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Building size={13} className="text-pink-600" /> City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div> */}

                {/* State */}
                {/* <div className="flex flex-col">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-pink-600" /> State
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
                    required
                  />
                </div> */}

                {/* Account Type */}
                {/* <div className="flex flex-col relative">
                  <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-pink-600" /> Account Type
                  </label>
                  <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="border border-pink-400 rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer text-[12px] sm:text-[13px]"
                  >
                    {form.userType === "user" ? "User" : "Logistic Partner"}
                    <ChevronDown size={14} className={`text-pink-600 ${showDropdown ? "rotate-180" : ""}`} />
                  </div>

                  {showDropdown && (
                    <div className="absolute z-10 w-full bg-white border border-pink-300 rounded-lg mt-1 shadow-md top-full">
                      <div
                        className="px-4 py-2 hover:bg-pink-100 cursor-pointer text-[12px] sm:text-[13px]"
                        onClick={() => {
                          setForm({ ...form, userType: "user" });
                          setShowDropdown(false);
                        }}
                      >
                        User
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] mt-2"
                >
                  Create Account & Continue
                  <ChevronRight size={15} className="sm:w-4 sm:h-4" />
                </button>
              </form>

              {/* Switch to Login */}
              <p className="text-[11px] text-gray-600 text-center mt-3">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsRegisterMode(false);
                    resetForm();
                  }}
                  className="text-pink-600 font-semibold hover:underline"
                >
                  Login here
                </button>
              </p>
            </>
          )}

          {/* Footer text */}
          <p className="text-[10px] sm:text-[12px] text-gray-500 text-center mt-4">
            We aim to redefine local and long-distance moving by making it transparent, customer-friendly, and supported by modern digital tools.
          </p>

        </div>
      </div>
    </div>
  );
};

export default MoveDetailsModal;

// // src/components/MoveDetailsModal.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   ChevronRight, 
//   Search, 
//   User, 
//   Phone, 
//   Mail, 
//   Lock, 
//   MapPin, 
//   Eye, 
//   EyeOff, 
//   CheckCircle, 
//   ChevronDown,
//   Building
// } from "lucide-react";
// import { toast } from "react-toastify";
// import { useAuthStore } from "../stores/useAuthStore";
// import { Link } from "react-router-dom";
// import axios from "axios";

// const MoveDetailsModal = ({ isOpen, onClose, onSubmit, companyCount = 0 }) => {
//   const { login, register } = useAuthStore();
//   const navigate = useNavigate();

//   const [isRegisterMode, setIsRegisterMode] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [otpStep, setOtpStep] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     password: "",
//     pincode: "",
//     city: "",
//     state: "",
//     userType: "user"
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // OTP Sender
//   const handleSendOtp = async () => {
//     if (!form.phone || form.phone.length < 10) {
//       toast.error("Please enter a valid phone number.");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://127.0.0.1:8000/api/method/localmoves.api.auth.send_otp",
//         { phone: form.phone }
//       );

//       const api = res.data?.message;

//       if (!api) {
//         toast.error("Unexpected server error");
//         return;
//       }

//       if (!api.success) {
//         toast.error(api.message);
//         return;
//       }

//       setOtpStep(true);
//       toast.success("OTP sent to your phone!");

//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to send OTP.");
//     }
//   };

//   // OTP Verify
//   const handleVerifyOtp = () => {
//     if (!otp || otp.length !== 6) {
//       toast.error("Enter valid 6-digit OTP");
//       return;
//     }
//     setIsVerified(true);
//     toast.success("OTP verified!");
//   };

//   // Validation for login mode
//   const validateLoginForm = () => {
//     if (!form.email.trim()) {
//       toast.error("Please enter your email address.");
//       return false;
//     }
//     if (!/\S+@\S+\.\S+/.test(form.email)) {
//       toast.error("Please enter a valid email address.");
//       return false;
//     }
//     if (!form.password.trim()) {
//       toast.error("Please enter your password.");
//       return false;
//     }
//     return true;
//   };

//   // Validation for register mode
//   const validateRegisterForm = () => {
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
//     if (!form.password.trim() || form.password.length < 6) {
//       toast.error("Please enter a password with at least 6 characters.");
//       return false;
//     }
//     if (!form.pincode.trim() || form.pincode.length !== 6) {
//       toast.error("Please enter a valid 6-digit pincode.");
//       return false;
//     }
//     if (!form.city.trim()) {
//       toast.error("Please enter your city.");
//       return false;
//     }
//     if (!form.state.trim()) {
//       toast.error("Please enter your state.");
//       return false;
//     }
//     if (!isVerified) {
//       toast.error("Please verify your phone number with OTP.");
//       return false;
//     }
//     return true;
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!validateLoginForm()) return;

//     const result = await login(form.email, form.password);

//     if (!result.success) {
//       toast.error(result.message || "Invalid credentials");
//       return;
//     }

//     // Store "extra details" locally for later pages
//     const extra = {
//       name: form.name,
//       phone: form.phone,
//       email: form.email
//     };
//     localStorage.setItem("moveUserDetails", JSON.stringify(extra));

//     toast.success("Logged in successfully!");

//     onSubmit?.(form);
//     onClose();
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!validateRegisterForm()) return;

//     const payload = {
//       fullName: form.name,
//       email: form.email,
//       password: form.password,
//       phone: form.phone,
//       pincode: form.pincode,
//       city: form.city,
//       state: form.state,
//       userType: form.userType,
//       otp: otp
//     };

//     try {
//       const result = await register(payload);

//       if (result.success) {
//         toast.success("Registration successful!");
        
//         // Store details
//         const extra = {
//           name: form.name,
//           phone: form.phone,
//           email: form.email
//         };
//         localStorage.setItem("moveUserDetails", JSON.stringify(extra));

//         onSubmit?.(form);
//         onClose();
//       } else {
//         toast.error(result.message || "Registration failed.");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Registration failed.");
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       phone: "",
//       email: "",
//       password: "",
//       pincode: "",
//       city: "",
//       state: "",
//       userType: "user"
//     });
//     setOtp("");
//     setOtpStep(false);
//     setIsVerified(false);
//     setShowPassword(false);
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
//         {!isRegisterMode && (
//           <div className="absolute -top-6 right-5 z-20 flex flex-col items-center justify-center bg-pink-600 text-white rounded-full w-13 h-13 shadow-xl border-4 border-white">
//             <span className="text-[15px] font-bold leading-none">{companyCount}</span>
//             <span className="text-[9px] mt-0.5">Results</span>
//           </div>
//         )}

//         {/* Modal Card */}
//         <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100 max-h-[85vh] overflow-y-auto z-10">

//           {!isRegisterMode ? (
//             <>
//               {/* LOGIN MODE */}
//               <div className="flex items-center justify-center mb-3 mt-4 text-pink-600 font-semibold text-[11px] sm:text-[14px]">
//                 <Search size={15} className="mr-2 sm:w-4 sm:h-4" />
//                 <span>
//                   We found {companyCount} transport providers for your move
//                 </span>
//               </div>

//               <h2 className="text-[12px] sm:text-[15px] font-semibold text-gray-800 mb-1 text-center">
//                 To view your moving quotes,
//               </h2>
//               <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
//                 please login using your details below:
//               </p>

//               <form onSubmit={handleLogin} className="space-y-3">
//                 {/* Email */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Mail size={13} className="text-pink-600" /> Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={form.email}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Password */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Lock size={13} className="text-pink-600" /> Password
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     placeholder="Enter your password"
//                     value={form.password}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Login Button */}
//                 <button
//                   type="submit"
//                   className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
//                 >
//                   Login & View Results
//                   <ChevronRight size={15} className="sm:w-4 sm:h-4" />
//                 </button>
//               </form>

//               {/* Switch to Register */}
//               <p className="text-[11px] text-gray-600 text-center mt-3">
//                 New user?{" "}
//                 <button
//                   onClick={() => {
//                     setIsRegisterMode(true);
//                     resetForm();
//                   }}
//                   className="text-pink-600 font-semibold hover:underline"
//                 >
//                   Create an account
//                 </button>
//               </p>
//             </>
//           ) : (
//             <>
//               {/* REGISTER MODE */}
//               <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-1 text-center">
//                 Create Account
//               </h2>
//               <p className="text-[11px] sm:text-[13px] text-gray-500 text-center mb-4">
//                 Join <span className="text-pink-600 font-semibold">Local Moves</span> today!
//               </p>

//               <form onSubmit={handleRegister} className="space-y-3">
//                 {/* Name */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <User size={13} className="text-pink-600" /> Full Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Enter your full name"
//                     value={form.name}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Email */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Mail size={13} className="text-pink-600" /> Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={form.email}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Password */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Lock size={13} className="text-pink-600" /> Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       placeholder="Create a password"
//                       value={form.password}
//                       onChange={handleChange}
//                       className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                       required
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff size={15} className="text-gray-500" />
//                       ) : (
//                         <Eye size={15} className="text-gray-500" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Phone + OTP */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Phone size={13} className="text-pink-600" /> Phone Number
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="tel"
//                       name="phone"
//                       placeholder="Enter phone number"
//                       value={form.phone}
//                       onChange={handleChange}
//                       className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                       required
//                     />
//                     {!isVerified ? (
//                       <button
//                         type="button"
//                         onClick={handleSendOtp}
//                         disabled={otpStep}
//                         className={`px-3 py-2 rounded-lg text-[11px] sm:text-[12px] text-white ${
//                           otpStep ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
//                         }`}
//                       >
//                         {otpStep ? "Sent" : "Send OTP"}
//                       </button>
//                     ) : (
//                       <span className="bg-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-[11px] sm:text-[12px]">
//                         <CheckCircle size={12} /> Verified
//                       </span>
//                     )}
//                   </div>
                  
//                   {otpStep && !isVerified && (
//                     <div className="flex gap-2 mt-2">
//                       <input
//                         type="text"
//                         placeholder="Enter 6-digit OTP"
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value)}
//                         className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                         maxLength={6}
//                       />
//                       <button
//                         type="button"
//                         onClick={handleVerifyOtp}
//                         className="px-4 py-2 border rounded-lg text-pink-600 border-pink-500 hover:bg-pink-50 text-[11px] sm:text-[12px]"
//                       >
//                         Verify
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Pincode */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <MapPin size={13} className="text-pink-600" /> Pincode
//                   </label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     placeholder="Enter pincode"
//                     value={form.pincode}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* City - Using Building icon instead of City */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <Building size={13} className="text-pink-600" /> City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     placeholder="Enter city"
//                     value={form.city}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* State */}
//                 <div className="flex flex-col">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <MapPin size={13} className="text-pink-600" /> State
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     placeholder="Enter state"
//                     value={form.state}
//                     onChange={handleChange}
//                     className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] sm:text-[13px] focus:ring-2 focus:ring-pink-500 outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Account Type */}
//                 <div className="flex flex-col relative">
//                   <label className="text-[11px] sm:text-[12px] font-medium text-gray-700 mb-1 flex items-center gap-1">
//                     <User size={13} className="text-pink-600" /> Account Type
//                   </label>
//                   <div
//                     onClick={() => setShowDropdown(!showDropdown)}
//                     className="border border-pink-400 rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer text-[12px] sm:text-[13px]"
//                   >
//                     {form.userType === "user" ? "User" : "Logistic Partner"}
//                     <ChevronDown size={14} className={`text-pink-600 ${showDropdown ? "rotate-180" : ""}`} />
//                   </div>

//                   {showDropdown && (
//                     <div className="absolute z-10 w-full bg-white border border-pink-300 rounded-lg mt-1 shadow-md top-full">
//                       <div
//                         className="px-4 py-2 hover:bg-pink-100 cursor-pointer text-[12px] sm:text-[13px]"
//                         onClick={() => {
//                           setForm({ ...form, userType: "user" });
//                           setShowDropdown(false);
//                         }}
//                       >
//                         User
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Register Button */}
//                 <button
//                   type="submit"
//                   className="w-full bg-pink-600 hover:bg-pink-700 text-white text-[12px] sm:text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] mt-2"
//                 >
//                   Create Account
//                   <ChevronRight size={15} className="sm:w-4 sm:h-4" />
//                 </button>
//               </form>

//               {/* Switch to Login */}
//               <p className="text-[11px] text-gray-600 text-center mt-3">
//                 Already have an account?{" "}
//                 <button
//                   onClick={() => {
//                     setIsRegisterMode(false);
//                     resetForm();
//                   }}
//                   className="text-pink-600 font-semibold hover:underline"
//                 >
//                   Login here
//                 </button>
//               </p>
//             </>
//           )}

//           {/* Footer text */}
//           <p className="text-[10px] sm:text-[12px] text-gray-500 text-center mt-4">
//             We aim to redefine local and long-distance moving by making it transparent, customer-friendly, and supported by modern digital tools.
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default MoveDetailsModal;

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
