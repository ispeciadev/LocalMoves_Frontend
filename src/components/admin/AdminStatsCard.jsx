import React from "react";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminStatsCard = ({ title, value, subtitle, badge }) => {
  const { isDarkMode } = useAdminThemeStore();

  return (
    <div className={`rounded-2xl p-4 shadow-sm transition-colors ${
      isDarkMode
        ? "bg-slate-800 border border-slate-700"
        : "bg-white"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium transition-colors ${
            isDarkMode ? "text-slate-400" : "text-gray-500"
          }`}>{title}</p>
          <p className={`mt-2 text-2xl font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-900"
          }`}>{value}</p>
          {subtitle && (
            <p className={`mt-1 text-xs transition-colors ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}>{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
            isDarkMode
              ? "bg-green-900/30 text-green-300"
              : "bg-green-50 text-green-700"
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminStatsCard;
