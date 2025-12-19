import React from "react";
import {
  FaBars,
  FaMoon,
  FaSun,
  FaCalendarAlt,
} from "react-icons/fa";
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
      className={`w-full px-4 py-2 border-b sticky top-0 z-40 transition-colors
        ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}
      `}
    >
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg bg-pink-600 text-white"
            onClick={() => onMenuClick?.(true)}
          >
            <FaBars size={18} />
          </button>

          <h1
            className={`text-lg font-semibold tracking-tight ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Admin Panel
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* DATE */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isDarkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FaCalendarAlt
              className={isDarkMode ? "text-slate-400" : "text-gray-500"}
            />
            <span className="truncate">{today}</span>
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={toggleDarkMode}
            className={`h-9 w-9 flex items-center justify-center rounded-full transition-colors ${
              isDarkMode
                ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
