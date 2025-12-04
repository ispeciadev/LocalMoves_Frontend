import React, { useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../../stores/useAuthStore";

const Settings = () => {
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState({
    full_name: user?.full_name || user?.fullName || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });

  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const updateProfile = async () => {
    if (!profile.full_name || !profile.phone) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      const res = await api.post("localmoves.api.auth.update_profile", {
        full_name: profile.full_name,
        phone: profile.phone,
      });

      const msg = res.data?.message;

      if (msg?.success) {
        toast.success("Profile updated successfully!");

        updateUser({
          ...user,
          full_name: msg.data?.full_name || profile.full_name,
          phone: msg.data?.phone || profile.phone,
        });
      } else {
        toast.error(msg?.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile"
      );
    }
  };

  const changePassword = async () => {
    const { old_password, new_password } = passwords;

    if (!old_password || !new_password) {
      toast.error("Enter both old and new password");
      return;
    }

    if (old_password === new_password) {
      toast.error("New password must be different from old password");
      return;
    }

    try {
      const res = await api.post("localmoves.api.auth.change_password", {
        old_password,
        new_password,
      });

      const msg = res.data?.message;

      if (msg?.success) {
        toast.success("Password changed successfully!");
        setPasswords({ old_password: "", new_password: "" });
      } else {
        toast.error(msg?.message || "Password change failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Password update failed"
      );
    }
  };

  return (
    <div className="dashboard-scrollbar w-full h-full overflow-auto p-6 bg-gray-100">
      <style>{`
        .dashboard-scrollbar::-webkit-scrollbar { display: none; }
        .dashboard-scrollbar { scrollbar-width: none; }
      `}</style>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 space-y-10">

        <h2 className="text-2xl font-bold text-pink-600 text-center mb-6">
          Account Settings
        </h2>

        {/* UPDATE PROFILE */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Profile Information
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              name="full_name"
              value={profile.full_name}
              onChange={handleProfileChange}
              placeholder="Full Name"
              className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              placeholder="Phone Number"
              className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          <button
            onClick={updateProfile}
            className="mt-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg hover:bg-pink-700 transition-all shadow-md"
          >
            Save Profile
          </button>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Change Password
          </h3>

          <div className="space-y-3">
            <input
              type="password"
              name="old_password"
              value={passwords.old_password}
              onChange={handlePasswordChange}
              placeholder="Current Password"
              className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-pink-500 outline-none"
            />

            <input
              type="password"
              name="new_password"
              value={passwords.new_password}
              onChange={handlePasswordChange}
              placeholder="New Password"
              className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          <button
            onClick={changePassword}
            className="mt-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg hover:bg-pink-700 transition-all shadow-md"
          >
            Update Password
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
