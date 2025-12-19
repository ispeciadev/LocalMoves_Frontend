// src/components/admin/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaHeadset,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminSidebar = ({ forcedHidden, onClose }) => {
  const { isDarkMode } = useAdminThemeStore();
  const [isSidebarVisible, setIsSidebarVisible] = useState(!forcedHidden);
  const navigate = useNavigate();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 md:py-2 text-sm font-medium transition
    ${
      isActive
        ? isDarkMode
          ? "bg-slate-800 text-white"
          : "bg-pink-600 text-white shadow-sm"
        : isDarkMode
        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
        : "text-pink-50 hover:bg-pink-700/40 hover:text-white"
    }`;

  useEffect(() => {
    setIsSidebarVisible(!forcedHidden);
  }, [forcedHidden]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.isOpen) {
        setIsSidebarVisible(false);
        onClose();
      }
    };

    window.addEventListener("hamburger-toggle", handler);
    window.addEventListener("admin-hamburger-toggle", handler);

    return () => {
      window.removeEventListener("hamburger-toggle", handler);
      window.removeEventListener("admin-hamburger-toggle", handler);
    };
  }, [onClose]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/admin/login");
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-48 z-40 flex flex-col   /* 🔥 WIDTH REDUCED FROM w-60 → w-48 */
          transition-transform duration-300
          ${
            isDarkMode
              ? "bg-slate-900 text-white"
              : "bg-gradient-to-b from-pink-600 to-pink-700 text-white"
          }
          ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold">Local Moves</span>

          <button
            className="md:hidden text-white"
            onClick={() => {
              setIsSidebarVisible(false);
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {/* MENU LINKS */}
        <nav className="mt-2 flex-1 space-y-1 px-3 pb-6 overflow-y-auto">
          <NavLink to="/admin" end className={navLinkClasses} onClick={handleMenuClick}>
            <FaTachometerAlt /> Dashboard
          </NavLink>

          <NavLink to="/admin/users" className={navLinkClasses} onClick={handleMenuClick}>
            <FaUsers /> Users
          </NavLink>

          <NavLink to="/admin/companies" className={navLinkClasses} onClick={handleMenuClick}>
            <FaBuilding /> Companies
          </NavLink>

          <NavLink to="/admin/requests" className={navLinkClasses} onClick={handleMenuClick}>
            <FaExchangeAlt /> Requests
          </NavLink>

          <NavLink to="/admin/payments" className={navLinkClasses} onClick={handleMenuClick}>
            <FaMoneyBillWave /> Payments
          </NavLink>

          <NavLink to="/admin/support" className={navLinkClasses} onClick={handleMenuClick}>
            <FaHeadset /> Support
          </NavLink>

          <NavLink to="/admin/ManageInventory" className={navLinkClasses} onClick={handleMenuClick}>
            <FaChartBar /> Manage Inventory
          </NavLink>

          <NavLink to="/admin/settings" className={navLinkClasses} onClick={handleMenuClick}>
            <FaCog /> Settings
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <div className="px-4 pb-5">
          <button
            onClick={() => {
              handleLogout();
              handleMenuClick();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
              ${
                isDarkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-white"
                  : "bg-white/20 hover:bg-white/30 text-white"
              }
            `}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => {
            setIsSidebarVisible(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default AdminSidebar;
