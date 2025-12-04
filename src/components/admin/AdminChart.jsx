import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

const AdminChart = ({ title, type = "bar", data, dataKey, secondaryKey }) => {
  const { isDarkMode } = useAdminThemeStore();

  return (
    <div className={`h-72 rounded-2xl p-4 shadow-sm transition-colors ${
      isDarkMode
        ? "bg-slate-800 border border-slate-700"
        : "bg-white"
    }`}>
      {/* Clean Header - removed D/W/M toggle */}
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className={`text-sm font-semibold transition-colors ${
            isDarkMode ? "text-slate-100" : "text-gray-800"
          }`}>{title}</h3>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke={isDarkMode ? "#475569" : "#e5e7eb"}
            />
            <XAxis 
              dataKey="name"
              tick={{ fill: isDarkMode ? "#94a3b8" : "#6b7280" }}
            />
            <YAxis 
              tick={{ fill: isDarkMode ? "#94a3b8" : "#6b7280" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#475569" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: isDarkMode ? "#f1f5f9" : "#1f2937"
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#6366f1"
              strokeWidth={2}
            />
            {secondaryKey && (
              <Line
                type="monotone"
                dataKey={secondaryKey}
                stroke="#22c55e"
                strokeWidth={2}
              />
            )}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke={isDarkMode ? "#475569" : "#e5e7eb"}
            />
            <XAxis 
              dataKey="name"
              tick={{ fill: isDarkMode ? "#94a3b8" : "#6b7280" }}
            />
            <YAxis 
              tick={{ fill: isDarkMode ? "#94a3b8" : "#6b7280" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#475569" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: isDarkMode ? "#f1f5f9" : "#1f2937"
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} barSize={30} fill="#6366f1" />
            {secondaryKey && (
              <Bar dataKey={secondaryKey} barSize={30} fill="#22c55e" />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AdminChart;
