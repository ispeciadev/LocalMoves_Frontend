// src/pages/logistic-dashboard/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Building2,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";

const Sidebar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showHamburger, setShowHamburger] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for hamburger menu state from Navbar
  useEffect(() => {
    const handleHamburgerToggle = (event) => {
      const { isOpen } = event.detail;
      setIsMobileMenuOpen(isOpen);
      setIsSidebarVisible(!isOpen);
    };

    window.addEventListener("hamburger-toggle", handleHamburgerToggle);
    return () =>
      window.removeEventListener("hamburger-toggle", handleHamburgerToggle);
  }, []);

  // Hide hamburger on scroll down
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 50) {
        setShowHamburger(false);
      } else {
        setShowHamburger(true);
      }
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300
     ${
       isActive
         ? "bg-pink-600 text-white shadow-lg shadow-pink-200 scale-[1.02]"
         : "text-gray-700 hover:bg-pink-100 hover:text-pink-700"
     }`;

  // Sidebar internal toggle
  const handleSidebarToggle = () => {
    const newVisibility = !isSidebarVisible;
    setIsSidebarVisible(newVisibility);

    if (!isMobileMenuOpen) {
      window.dispatchEvent(
        new CustomEvent("sidebar-toggle", {
          detail: { isVisible: newVisibility },
        })
      );
    }
  };

  return (
    <>
      {/* ▼ FIXED POSITION: ARROW NOW TOUCHES "HOME" PERFECTLY */}
      {showHamburger && !isMobileMenuOpen && (
        <button
          onClick={handleSidebarToggle}
          className="lg:hidden fixed top-[68px] -left-0 z-50 p-1 transition-opacity duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-gray-800"
          >
            {isSidebarVisible ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 
          bg-white/90 backdrop-blur-xl border-r border-pink-100 
          shadow-none flex flex-col justify-between p-6
          transform transition-transform duration-300 ease-out
          ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:block z-40`}
      >
        <div>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-extrabold text-pink-600 drop-shadow-sm">
              🚚
            </h2>

            <button
              onClick={() => setIsSidebarVisible(false)}
              className="lg:hidden text-gray-500 hover:text-gray-800 p-1 -mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-3">
            <NavLink
              to="/logistic-dashboard/home"
              className={linkClasses}
              onClick={() => setIsSidebarVisible(false)}
            >
              <LayoutDashboard className="w-5 h-5" /> Home
            </NavLink>

            <NavLink
              to="/logistic-dashboard/customers"
              className={linkClasses}
              onClick={() => setIsSidebarVisible(false)}
            >
              <Users className="w-5 h-5" /> Customers
            </NavLink>

            <NavLink
              to="/logistic-dashboard/subscription-plan"
              className={linkClasses}
              onClick={() => setIsSidebarVisible(false)}
            >
              <CreditCard className="w-5 h-5" /> Subscription Plan
            </NavLink>

            <NavLink
              to="/logistic-dashboard/settings"
              className={linkClasses}
              onClick={() => setIsSidebarVisible(false)}
            >
              <Settings className="w-5 h-5" /> Profile Settings
            </NavLink>

            <NavLink
              to="/logistic-dashboard/edit-company"
              className={linkClasses}
              onClick={() => setIsSidebarVisible(false)}
            >
              <Building2 className="w-5 h-5" /> Edit Company
            </NavLink>
          </nav>
        </div>

        <button
          onClick={() => {
            handleLogout();
            setIsSidebarVisible(false);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 
                    bg-pink-600 text-white rounded-md shadow-lg shadow-pink-200 
                    hover:bg-pink-700 transition duration-200 mt-6"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Overlay */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
