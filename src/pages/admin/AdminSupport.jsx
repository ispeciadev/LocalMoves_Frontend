import React from "react";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const tickets = [
  {
    id: "SUP-1101",
    title: "Payment failed but amount deducted",
    company: "Swift Movers",
    priority: "High",
    status: "Open",
  },
  {
    id: "SUP-1102",
    title: "Unable to edit company address",
    company: "MovePlus",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: "SUP-1103",
    title: "User cannot login to dashboard",
    company: "Fast Logistics",
    priority: "High",
    status: "Resolved",
  },
];

const getBadgeColor = (priority, isDarkMode) => {
  if (isDarkMode) {
    const colors = {
      High: "bg-red-900/30 text-red-300",
      Medium: "bg-yellow-900/30 text-yellow-300",
      Low: "bg-green-900/30 text-green-300",
    };
    return colors[priority] || "bg-slate-700 text-slate-300";
  }
  const colors = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-yellow-50 text-yellow-700",
    Low: "bg-green-50 text-green-700",
  };
  return colors[priority] || "bg-gray-50 text-gray-700";
};

const getStatusColor = (status, isDarkMode) => {
  if (isDarkMode) {
    const colors = {
      Open: "bg-purple-900/30 text-purple-300",
      "In Progress": "bg-blue-900/30 text-blue-300",
      Resolved: "bg-green-900/30 text-green-300",
    };
    return colors[status] || "bg-slate-700 text-slate-300";
  }
  const colors = {
    Open: "bg-purple-50 text-purple-700",
    "In Progress": "bg-blue-50 text-blue-700",
    Resolved: "bg-green-50 text-green-700",
  };
  return colors[status] || "bg-gray-50 text-gray-700";
};

const AdminSupport = () => {
  const { isDarkMode } = useAdminThemeStore();
  return (
    <div className={`space-y-5 transition-colors ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-gray-900"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-lg font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}>Support</h1>
          <p className={`text-xs transition-colors ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>
            Handle issues raised by companies and users.
          </p>
        </div>
        <button className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
          isDarkMode
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-purple-600 px-4 py-2 text-xs font-medium text-white hover:bg-purple-700"
        }`}>
          Create Ticket
        </button>
      </div>

      <div className={`rounded-2xl p-4 shadow-sm transition-colors ${
        isDarkMode
          ? "bg-slate-800 border border-slate-700"
          : "bg-white border border-gray-100"
      }`}>
        <h2 className={`text-sm font-semibold transition-colors ${
          isDarkMode ? "text-slate-100" : "text-gray-800"
        }`}>Recent Tickets</h2>

        <div className="mt-3 space-y-3 text-xs">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`flex items-start justify-between rounded-xl border px-3 py-3 transition-colors ${
                isDarkMode
                  ? "border-slate-700 bg-slate-700/50 text-slate-100"
                  : "border-gray-100 bg-gray-50 text-gray-900"
              }`}
            >
              <div>
                <p className={`text-[11px] font-medium transition-colors ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  #{ticket.id}
                </p>
                <p className={`mt-1 text-sm font-semibold transition-colors ${
                  isDarkMode ? "text-slate-100" : "text-gray-900"
                }`}>
                  {ticket.title}
                </p>
                <p className={`mt-1 text-[11px] transition-colors ${
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}>
                  Company: {ticket.company}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    getBadgeColor(ticket.priority, isDarkMode)
                  }`}
                >
                  {ticket.priority} priority
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    getStatusColor(ticket.status, isDarkMode)
                  }`}
                >
                  {ticket.status}
                </span>
                <button className={`text-[11px] font-medium transition-colors ${
                  isDarkMode
                    ? "text-purple-400 hover:underline"
                    : "text-purple-600 hover:underline"
                }`}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
