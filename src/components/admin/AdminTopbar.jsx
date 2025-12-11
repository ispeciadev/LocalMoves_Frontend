// src/components/admin/AdminTopbar.jsx
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaMoon,
  FaSun,
  FaCalendarAlt,
  FaEllipsisV,
  FaTimes,
} from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminTopbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleDarkMode } = useAdminThemeStore();
  const [rightMenuOpen, setRightMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const detail = { isOpen: rightMenuOpen };
    window.dispatchEvent(new CustomEvent("admin-hamburger-toggle", { detail }));
  }, [rightMenuOpen]);

  return (
    <>
      {/* TOP BAR */}
      <header
        className={`w-full flex justify-center px-4 py-2 border-b sticky top-0 z-[70] transition-colors
        ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}
      >
        {/* WIDTH-REDUCED CENTERED CONTAINER */}
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
              className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors ${
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

            {/* Theme Toggle */}
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

            {/* Mobile right menu */}
            <button
              className={`p-2 rounded-lg md:hidden transition-colors ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setRightMenuOpen(true)}
            >
              <FaEllipsisV size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* RIGHT SLIDE-OVER MENU */}
      <div
        data-admin-right-menu
        data-open={rightMenuOpen ? "true" : "false"}
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 z-[90] shadow-lg transition-transform duration-300 md:hidden
          ${isDarkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"}
          ${rightMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div
          className={`flex items-center justify-between px-4 h-14 border-b ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-lg font-semibold">Menu</h2>

          <button
            onClick={() => setRightMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm font-medium">
          <a href="/admin" className="block hover:text-pink-500">
            Dashboard
          </a>

          <a href="/admin/register-company" className="block hover:text-pink-500">
            Register Company
          </a>

          <button
            onClick={() => setRightMenuOpen(false)}
            className="text-left w-full hover:text-pink-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {rightMenuOpen && (
        <div
          data-admin-overlay
          className="fixed inset-0 bg-black/40 z-[80] md:hidden"
          onClick={() => setRightMenuOpen(false)}
        />
      )}
    </>
  );
};

export default AdminTopbar;
