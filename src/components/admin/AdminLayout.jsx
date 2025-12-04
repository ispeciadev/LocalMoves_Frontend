// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaMoneyBillWave,
  FaCog,
  FaTimes,
} from "react-icons/fa";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
import AdminTopbar from "./AdminTopbar";

const navItemBaseClasses =
  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all";

const getNavItemClasses = ({ isActive }, isDarkMode) =>
  `${navItemBaseClasses} ${
    isActive
      ? isDarkMode
        ? "bg-pink-700/30 text-pink-400 shadow-sm"
        : "bg-pink-100 text-pink-600 shadow-sm"
      : isDarkMode
      ? "text-slate-400 hover:bg-slate-700/50"
      : "text-gray-600 hover:bg-gray-50"
  }`;

function AdminLayout() {
  const { isDarkMode } = useAdminThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex transition-colors ${
        isDarkMode ? "bg-slate-950" : "bg-gray-50"
      }`}
    >
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-[70] h-full w-64 border-r flex-col transition-all duration-300
          ${isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* SIDEBAR HEADER */}
        <div
          className={`h-16 flex items-center justify-between px-6 border-b transition-colors ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <span className="text-xl font-bold text-pink-600 tracking-tight">
            LocalMoves Admin
          </span>

          {/* Mobile close */}
          <button className="md:hidden text-pink-300" onClick={() => setOpen(false)}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaTachometerAlt className="text-pink-500" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaUsers className="text-pink-500" />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/companies"
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaBuilding className="text-pink-500" />
            <span>Companies</span>
          </NavLink>

          <NavLink
            to="/admin/requests"
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaClipboardList className="text-pink-500" />
            <span>Requests</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaMoneyBillWave className="text-pink-500" />
            <span>Payments</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={(props) => getNavItemClasses(props, isDarkMode)}
            onClick={() => setOpen(false)}
          >
            <FaCog className="text-pink-500" />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* FOOTER */}
        <div
          className={`px-4 py-4 border-t text-xs transition-colors ${
            isDarkMode ? "border-slate-700 text-slate-500" : "border-gray-200 text-gray-400"
          }`}
        >
          © {new Date().getFullYear()} LocalMoves
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR — hamburger is handled inside AdminTopbar */}
        <AdminTopbar onMenuClick={() => setOpen(true)} />

        <main
          className={`flex-1 p-4 md:p-6 overflow-y-auto min-h-0 flex flex-col transition-colors ${
            isDarkMode ? "bg-slate-950" : "bg-gray-50"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
