// src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminSettings = () => {
  const { isDarkMode } = useAdminThemeStore();
  // -----------------------------
  // PROFILE FORM STATE
  // -----------------------------
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
  });

  // -----------------------------
  // PASSWORD FORM STATE
  // -----------------------------
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // -----------------------------
  // AUTO LOAD USER FROM LOCALSTORAGE
  // -----------------------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setProfile({
        full_name: user.full_name || "",
        phone: user.phone || "",
      });
    }
  }, []);

  // -----------------------------
  // HANDLE PROFILE INPUT CHANGE
  // -----------------------------
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------
  // HANDLE PASSWORD INPUT
  // -----------------------------
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------------
  // UPDATE PROFILE API
  // -----------------------------
  const updateProfile = async () => {
    if (!profile.full_name.trim() || !profile.phone.trim()) {
      toast.error("Full name and phone number are required.");
      return;
    }

    try {
      const payload = {
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim(),
      };

      const res = await api.post("localmoves.api.auth.update_profile", payload);

      const updated = res.data?.message?.data;

      if (updated) {
        // update localStorage so navbar reflects changes
        const old = JSON.parse(localStorage.getItem("user"));
        const newUser = { ...old, ...updated };
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // -----------------------------
  // CHANGE PASSWORD API
  // -----------------------------
  const changePassword = async () => {
    const { old_password, new_password, confirm_password } = passwordForm;

    if (!old_password || !new_password || !confirm_password) {
      toast.error("All password fields are required.");
      return;
    }

    if (new_password !== confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await api.post("localmoves.api.auth.change_password", {
        old_password,
        new_password,
      });

      toast.success("Password changed successfully!");

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Incorrect old password.");
    }
  };

  return (
    <div className={`space-y-5 transition-colors ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
    }`}>
      <div>
        <h1 className={`text-lg font-semibold transition-colors ${
          isDarkMode ? "text-slate-100" : "text-gray-900"
        }`}>Settings</h1>
        <p className={`text-xs transition-colors ${
          isDarkMode ? "text-slate-400" : "text-gray-500"
        }`}>
          Manage platform configuration and admin profile.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* =============================== */}
        {/* PROFILE SETTINGS */}
        {/* =============================== */}
        <div className={`rounded-2xl p-5 shadow-sm transition-colors ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}>
          <h2 className={`text-sm font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-800"
          }`}>Admin Profile</h2>
          <p className={`mt-1 text-xs transition-colors ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Update your name and phone number.
          </p>

          <div className="mt-4 space-y-3 text-xs">
            {/* FULL NAME */}
            <div>
              <label className={`mb-1 block text-[11px] font-medium transition-colors ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}>
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleProfileChange}
                placeholder="Enter full name"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:bg-slate-700"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white"
                }`}
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className={`mb-1 block text-[11px] font-medium transition-colors ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Enter phone number"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:bg-slate-700"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={updateProfile}
              className={`mt-2 rounded-full px-4 py-2 text-xs font-medium shadow transition-colors ${
                isDarkMode
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* =============================== */}
        {/* CHANGE PASSWORD */}
        {/* =============================== */}
        <div className={`rounded-2xl p-5 shadow-sm transition-colors ${
          isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"
        }`}>
          <h2 className={`text-sm font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-800"
          }`}>
            Change Password
          </h2>
          <p className={`mt-1 text-xs transition-colors ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Update your account security.
          </p>

          <div className="mt-4 space-y-3 text-xs">
            {/* OLD PASSWORD */}
            <div>
              <label className={`mb-1 block text-[11px] font-medium transition-colors ${
                isDarkMode ? "text-slate-300" : "text-gray-600"
              }`}>
                Old Password
              </label>
              <input
                type="password"
                name="old_password"
                value={passwordForm.old_password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:bg-slate-700"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white"
                }`}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {/* NEW PASSWORD */}
              <div>
                <label className={`mb-1 block text-[11px] font-medium transition-colors ${
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                }`}>
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:bg-slate-700"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className={`mb-1 block text-[11px] font-medium transition-colors ${
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                }`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-pink-500 transition-colors ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-pink-500 focus:bg-slate-700"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={changePassword}
              className={`mt-2 rounded-full px-4 py-2 text-xs font-medium shadow transition-colors ${
                isDarkMode
                  ? "bg-pink-600 text-white hover:bg-pink-700"
                  : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;
