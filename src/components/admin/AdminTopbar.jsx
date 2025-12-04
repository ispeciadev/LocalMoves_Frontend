import React from "react";
import { FaBars, FaMoon, FaSun, FaCalendarAlt } from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminTopbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleDarkMode } = useAdminThemeStore();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 border-b transition-colors ${
        isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
      }`}
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        
        {/* MOBILE HAMBURGER */}
        <button
          className="md:hidden p-2 rounded-lg bg-pink-600 text-white"
          onClick={onMenuClick}
        >
          <FaBars size={18} />
        </button>

        {/* TOPBAR TITLE */}
        <h1 className={`text-base md:text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-gray-700"
        }`}>
          Admin Panel
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* TODAY DATE */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors ${
            isDarkMode
              ? "bg-slate-800 text-slate-300"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <FaCalendarAlt className={isDarkMode ? "text-slate-400" : "text-gray-500"} />
          <span>{today}</span>
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleDarkMode}
          className={`h-9 w-9 flex items-center justify-center rounded-full transition ${
            isDarkMode
              ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>

      </div>
    </header>
  );
};

export default AdminTopbar;
