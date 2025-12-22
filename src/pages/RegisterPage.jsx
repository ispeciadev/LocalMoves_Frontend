import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCity,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaChevronDown,
} from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import registerIllustration from "../assets/login-abstract.png";
import axios from "axios";
import env from "../config/env";

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    userType: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ⭐ REAL BACKEND OTP SENDER
  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      const res = await axios.post(
        `${env.API_BASE_URL}localmoves.api.auth.send_otp`,
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

  // ⭐ OTP VERIFY (Frontend Only → Backend will verify at signup)
  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }
    setIsVerified(true);
    toast.success("OTP added. Completing Signup…");
  };

  // ⭐ SIGNUP — INCLUDING OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpStep) {
      toast.error("Please send OTP first.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter OTP.");
      return;
    }

    if (!isVerified) {
      toast.error("Please verify OTP.");
      return;
    }

    const payload = {
      ...form,
      otp: otp, // ⭐ Send OTP to backend through store
    };

    try {
      const result = await register(payload);

      if (result.success) {
        toast.success("Signup successful!");
        navigate("/");
      } else {
        toast.error(result.message || "Signup failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* Left Section */}
      <div className="hidden md:flex w-1/2 justify-center items-center bg-linear-to-br from-pink-50 to-pink-100">
        <img
          src={registerIllustration}
          alt="Register Illustration"
          className="max-w-md rounded-3xl shadow-xl object-contain"
        />
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">

          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
            <HiUserAdd className="text-pink-600" />
            Create Account
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Join <span className="text-pink-600 font-semibold">Local Moves</span> today!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaUser className="text-pink-600" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaEnvelope className="text-pink-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaLock className="text-pink-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* Phone + OTP */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaPhoneAlt className="text-pink-600" />
                Phone Number
              </label>

              <div className="flex gap-2">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />

                {!isVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpStep}
                    className={`px-3 py-2 rounded-lg text-white ${otpStep ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
                      }`}
                  >
                    {otpStep ? "Sent" : "Send OTP"}
                  </button>
                ) : (
                  <span className="bg-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1">
                    <FaCheckCircle /> Verified
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
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 border rounded-lg text-pink-600 border-pink-500 hover:bg-pink-50"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaMapMarkerAlt className="text-pink-600" />
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaCity className="text-pink-600" />
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* State */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaMapMarkerAlt className="text-pink-600" />
                State
              </label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
              />
            </div>

            {/* Account Type */}
            <div className="relative">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                <FaUser className="text-pink-600" />
                Account Type
              </label>

              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="border border-pink-400 rounded-lg px-4 py-2 flex justify-between cursor-pointer"
              >
                {form.userType === "user" ? "User" : "Logistic Partner"}
                <FaChevronDown
                  className={`text-pink-600 ${showDropdown ? "rotate-180" : ""}`}
                />
              </div>

              {showDropdown && (
                <div className="absolute z-10 w-full bg-white border border-pink-300 rounded-lg mt-1 shadow-md">

                  <div
                    className="px-4 py-2 hover:bg-pink-100 cursor-pointer"
                    onClick={() => {
                      setForm({ ...form, userType: "user" });
                      setShowDropdown(false);
                    }}
                  >
                    User
                  </div>

                  {/* 
                  <div
                    className="px-4 py-2 hover:bg-pink-100 cursor-pointer"
                    onClick={() => {
                      setForm({ ...form, userType: "logistic" });
                      setShowDropdown(false);
                    }}
                  >
                    Logistic Partner
                  </div>
                  */}

                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <HiUserAdd />
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-pink-600 cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
