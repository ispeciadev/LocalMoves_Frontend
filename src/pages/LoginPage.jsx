// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "react-toastify";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import loginIllustration from "../assets/login-abstract.png";
import axios from "axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sending, setSending] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ----------------------------
  // 🔥 Forgot Password Submit
  // ----------------------------
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/method/localmoves.api.auth.forgot_password",
        { email: forgotEmail }
      );

      if (res.data?.message?.success) {
        toast.success(res.data.message.message);

        setShowForgotModal(false);
        setForgotEmail("");
      } else {
        toast.error("Unable to send reset link.");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  // ----------------------------
  // Existing Login Submit
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      console.log("🔐 Login result:", result);

      if (result.success) {
        toast.success("Login successful!");

        localStorage.removeItem("companyRegistered");
        localStorage.removeItem("hasSubscription");

        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("user_email", result.user.email);

        // ⭐ ADD THESE THREE LINES (THE FIX)
        localStorage.setItem("user_full_name", result.user.full_name || "");
        localStorage.setItem("user_phone", result.user.phone || "");
        localStorage.setItem("user_email", result.user.email || "");

        // Your backend does NOT provide name/phone, so store safe fallback values
localStorage.setItem("user_full_name", result.user.full_name || result.user.name || "");
localStorage.setItem("user_phone", result.user.phone || "");

        window.dispatchEvent(new Event("subscription-updated"));

        const role = result.user?.role;

        if (
          role === "Admin" ||
          role === "Administrator" ||
          role === "System Manager"
        ) {
          navigate("/admin", { replace: true });
        } else if (role === "Logistics Manager") {
          navigate("/logistic-dashboard/home", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        toast.error(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ------------------------------ */}
      {/* 💗 Improved Forgot Password Modal */}
      {/* ------------------------------ */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-pink-600 text-xl"
              onClick={() => setShowForgotModal(false)}
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Your Password?</h2>
              <p className="text-gray-600 mt-1">
                Enter your email and we’ll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`w-full py-2.5 rounded-lg font-semibold ${
                  sending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 text-white shadow-md"
                }`}
              >
                {sending ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                className="w-full py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowForgotModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------ */}
      {/* ORIGINAL LOGIN PAGE */}
      {/* ------------------------------ */}
      <div className="min-h-screen flex bg-gray-50">
        <div className="hidden md:flex w-1/2 justify-center items-center">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="max-w-md rounded-3xl shadow-2xl object-contain"
          />
        </div>

        <div className="flex w-full md:w-1/2 justify-center items-center p-6 sm:p-8">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Log in to continue to{" "}
              <span className="text-pink-600 font-semibold">Local Moves</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <Mail size={18} className="text-pink-600" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                  <Lock size={18} className="text-pink-600" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2/4 -translate-y-1/2 text-gray-500 hover:text-pink-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* 🔥 Forgot Password Link */}
                <p
                  className="text-right text-sm text-pink-600 font-semibold mt-1 cursor-pointer hover:underline"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-semibold ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 text-white shadow-md"
                }`}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="text-center mt-5">
              <p className="text-gray-600">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-pink-600 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
