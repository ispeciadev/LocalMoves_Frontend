import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/logistic/Sidebar";

const LogisticDashboard = () => {
  const location = useLocation();
  const isCustomersPage = location.pathname.startsWith(
    "/logistic-dashboard/customers"
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 overflow-y-auto ${
          isCustomersPage ? "no-scrollbar" : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default LogisticDashboard;
