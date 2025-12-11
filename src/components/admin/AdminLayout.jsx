// src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  const { isDarkMode } = useAdminThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden transition-colors ${
        isDarkMode ? "bg-slate-950" : "bg-gray-50"
      }`}
    >
      {/* SIDEBAR */}
      <AdminSidebar
        forcedHidden={!isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* RIGHT SECTION */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* TOPBAR */}
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* MAIN CONTENT — ONLY THIS SHOULD SCROLL */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 transition-colors ${
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
