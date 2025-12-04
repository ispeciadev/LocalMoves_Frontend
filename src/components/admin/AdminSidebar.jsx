import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaHeadset,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

const navLinkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition 
   ${
     isActive
       ? "bg-purple-600 text-white shadow-sm"
       : "text-purple-100 hover:bg-purple-700/60 hover:text-white"
   }`;

const AdminSidebar = () => {
  return (
    <aside className="flex w-60 flex-col bg-gradient-to-b from-purple-900 to-purple-800 text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-lg font-semibold">Local Moves</span>
        <span className="text-xl">☰</span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        <NavLink to="/admin" end className={navLinkClasses}>
          <FaTachometerAlt className="text-base" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={navLinkClasses}>
          <FaUsers className="text-base" />
          <span>Users</span>
        </NavLink>

        <NavLink to="/admin/companies" className={navLinkClasses}>
          <FaBuilding className="text-base" />
          <span>Companies</span>
        </NavLink>

        <NavLink to="/admin/requests" className={navLinkClasses}>
          <FaExchangeAlt className="text-base" />
          <span>Requests</span>
        </NavLink>

        <NavLink to="/admin/payments" className={navLinkClasses}>
          <FaMoneyBillWave className="text-base" />
          <span>Payments</span>
        </NavLink>

        <NavLink to="/admin/support" className={navLinkClasses}>
          <FaHeadset className="text-base" />
          <span>Support</span>
        </NavLink>

        <NavLink to="/admin/analytics" className={navLinkClasses}>
          <FaChartBar className="text-base" />
          <span>Analytics</span>
        </NavLink>

        <NavLink to="/admin/settings" className={navLinkClasses}>
          <FaCog className="text-base" />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-purple-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-purple-500">
            {/* dummy avatar */}
            <img
              src="https://i.pravatar.cc/100?img=47"
              alt="Admin"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Super Admin</p>
            <p className="text-xs text-purple-200">admin@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
