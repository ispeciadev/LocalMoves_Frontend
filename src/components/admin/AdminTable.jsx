import React from "react";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const statusColors = {
  Pending: (isDark) => isDark ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-50 text-yellow-700",
  Ongoing: (isDark) => isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-700",
  Completed: (isDark) => isDark ? "bg-green-900/30 text-green-300" : "bg-green-50 text-green-700",
  Cancelled: (isDark) => isDark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-700",
  Overdue: (isDark) => isDark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-700",
};

const AdminTable = ({ title, columns, rows, actionLabel }) => {
  const { isDarkMode } = useAdminThemeStore();

  return (
    <div className={`mt-5 rounded-2xl p-4 shadow-sm transition-colors ${isDarkMode
        ? "bg-slate-800 border border-slate-700"
        : "bg-white"
      }`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`text-sm font-semibold transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-800"
          }`}>{title}</h3>
        {actionLabel && (
          <button className={`text-xs font-medium transition-colors ${isDarkMode
              ? "text-purple-400 hover:text-purple-300"
              : "text-purple-600 hover:underline"
            }`}>
            {actionLabel}
          </button>
        )}
      </div>

      <div>
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className={`border-b text-[11px] uppercase font-medium transition-colors ${isDarkMode
                ? "border-slate-700 bg-slate-700/50 text-slate-400"
                : "border-gray-200 bg-gray-50 text-gray-500"
              }`}>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b text-[13px] transition-colors ${isDarkMode
                    ? "border-slate-700 text-slate-300 hover:bg-slate-700/30"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  } last:border-b-0`}
              >
                {columns.map((col) => {
                  const value = row[col.key];

                  if (col.key === "status") {
                    return (
                      <td key={col.key} className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${statusColors[value]?.(isDarkMode) || (isDarkMode ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-700")
                            }`}
                        >
                          {value}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="px-3 py-2">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
