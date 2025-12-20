// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import api from "../../api/axios";
import { useAdminThemeStore } from "../../stores/useAdminThemeStore";

// -----------------------------------------------------------
// DATE HELPERS
// -----------------------------------------------------------
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonthLabel(monthString) {
  if (!monthString || !monthString.includes("-")) return monthString || "-";
  const [year, month] = monthString.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

// -----------------------------------------------------------
// PREMIUM UI COMPONENTS
// -----------------------------------------------------------

// 🟣 Glassy Stat Card
function StatCard({ label, value, highlight, isDarkMode, icon: Icon }) {
  const numeric = Number(value ?? 0);

  return (
    <div
      className={`backdrop-blur-md border shadow-sm hover:shadow-md rounded-2xl p-3 md:p-4 flex items-center justify-between transition-all duration-200 ${isDarkMode
        ? "bg-slate-800/90 border-slate-700"
        : "bg-white/90 border-pink-200"
        }`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-[10px] md:text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"
            }`}
        >
          {label}
        </p>
        <p
          className={`text-xl md:text-2xl font-bold tracking-tight ${highlight
            ? "bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent"
            : isDarkMode
              ? "text-slate-100"
              : "text-gray-900"
            }`}
        >
          {numeric.toLocaleString()}
        </p>
      </div>

      <div
        className={`h-8 w-8 md:h-10 md:w-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ml-2 md:ml-3 ${highlight
          ? "bg-gradient-to-br from-pink-700 to-pink-600 text-white"
          : isDarkMode
            ? "bg-slate-700 text-slate-400"
            : "bg-gray-100 text-gray-500"
          }`}
      >
        {Icon && <Icon className="text-base md:text-lg" />}
      </div>
    </div>
  );
}

// 💸 Metric Card
function MetricCard({ title, value, badge, isDarkMode }) {
  const numeric = Number(value ?? 0);
  return (
    <div
      className={`backdrop-blur-md border hover:shadow-md shadow-sm rounded-2xl p-4 md:p-5 transition-all duration-200 ${isDarkMode
        ? "bg-slate-800/90 border-slate-700 hover:border-slate-600"
        : "bg-white/90 border-pink-200 hover:border-pink-300"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className={`text-[11px] md:text-xs font-medium uppercase tracking-wide truncate transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
            }`}
        >
          {title}
        </p>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] md:text-[11px] font-medium shadow-sm transition-colors flex-shrink-0 ml-2 ${isDarkMode
              ? "bg-pink-900/30 text-pink-300"
              : "bg-pink-100 text-pink-800"
              }`}
          >
            {badge}
          </span>
        )}
      </div>

      <p
        className={`text-xl md:text-2xl lg:text-3xl font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
          }`}
      >
        ₹{numeric.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// 🔄 Tabs
function RangeTabs({ value, onChange, isDarkMode }) {
  return (
    <div
      className={`inline-flex rounded-full px-1.5 py-1 text-[10px] md:text-xs shadow-inner transition-colors w-full sm:w-auto ${isDarkMode ? "bg-slate-700" : "bg-gray-100"
        }`}
    >
      {[
        { key: "seven_days", label: "7D" },
        { key: "one_month", label: "30D" },
        { key: "one_year", label: "12M" },
      ].map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`px-2 md:px-3 py-1 rounded-full transition-all font-medium flex-1 sm:flex-none ${value === opt.key
            ? "bg-gradient-to-r from-pink-700 to-pink-600 text-white shadow"
            : isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-gray-500 hover:text-gray-800"
            }`}
        >
          <span className="hidden sm:inline">{opt.label}</span>
          <span className="sm:hidden">
            {opt.key === "seven_days" ? "7D" : opt.key === "one_month" ? "30D" : "12M"}
          </span>
        </button>
      ))}
    </div>
  );
}

// -----------------------------------------------------------
// RECHARTS TOOLTIP COMPONENTS
// -----------------------------------------------------------
function RevenueTooltip({ active, payload, label, isDarkMode }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const value = Number(item.value || 0);

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs shadow-md transition-colors ${isDarkMode
        ? "bg-slate-800 border-slate-700 text-slate-100"
        : "bg-white border-pink-200"
        }`}
    >
      <p
        className={`font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-700"
          }`}
      >
        {label}
      </p>
      <p className="mt-1 text-pink-400 font-medium truncate">
        Revenue: ₹{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function UsersTooltip({ active, payload, label, isDarkMode }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const value = Number(item.value || 0);

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs shadow-md transition-colors ${isDarkMode
        ? "bg-slate-800 border-slate-700 text-slate-100"
        : "bg-white border-fuchsia-200"
        }`}
    >
      <p
        className={`font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-700"
          }`}
      >
        {label}
      </p>
      <p className="mt-1 text-fuchsia-400 font-medium truncate">
        New users: {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// -----------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------
function AdminDashboard() {
  const { isDarkMode } = useAdminThemeStore();
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState({
    seven_days: [],
    one_month: [],
    one_year: [],
  });
  const [userGrowthChart, setUserGrowthChart] = useState({
    seven_days: [],
    one_month: [],
    one_year: [],
  });

  const [depositChart, setDepositChart] = useState({
    seven_days: [],
    one_month: [],
    one_year: [],
  });
  const [selectedDepositRange, setSelectedDepositRange] = useState("seven_days");

  const [selectedRevenueRange, setSelectedRevenueRange] = useState("seven_days");
  const [selectedUserRange, setSelectedUserRange] = useState("seven_days");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, revenueRes, userRes, depositRes] = await Promise.all([
        api.get("localmoves.api.dashboard.get_dashboard_stats"),
        api.get("localmoves.api.dashboard.get_revenue_chart"),
        api.get("localmoves.api.dashboard.get_user_growth_chart"),
        api.get("localmoves.api.dashboard.get_deposit_payment_chart"),
      ]);

      const statsData = statsRes.data?.message?.data || {};
      const revenueData = revenueRes.data?.message?.data || {};
      const userData = userRes.data?.message?.data || {};
      const depositData = depositRes.data?.message?.data || {};

      setDepositChart({
        seven_days: depositData.seven_days || [],
        one_month: depositData.one_month || [],
        one_year: depositData.one_year || [],
      });

      setStats(statsData);
      setRevenueChart({
        seven_days: revenueData.seven_days || [],
        one_month: revenueData.one_month || [],
        one_year: revenueData.one_year || [],
      });
      setUserGrowthChart({
        seven_days: userData.seven_days || [],
        one_month: userData.one_month || [],
        one_year: userData.one_year || [],
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please check the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const totals = stats?.totals || {};
  const revenue = stats?.revenue || {};
  const subscriptions = stats?.subscriptions || [];
  const recent = stats?.recent || {};

  // -------------------------------------------------------
  // TRANSFORM DATA FOR RECHARTS
  // -------------------------------------------------------
  const revenueRangeData = revenueChart[selectedRevenueRange] || [];
  const userRangeData = userGrowthChart[selectedUserRange] || [];

  const revenueChartData = revenueRangeData.map((item) => ({
    rawLabel: selectedRevenueRange === "one_year" ? item.month : item.date,
    label:
      selectedRevenueRange === "one_year"
        ? formatMonthLabel(item.month)
        : formatDateShort(item.date),
    revenue: Number(item.revenue || 0),
  }));

  const userChartData = userRangeData.map((item) => ({
    rawLabel: selectedUserRange === "one_year" ? item.month : item.date,
    label:
      selectedUserRange === "one_year"
        ? formatMonthLabel(item.month)
        : formatDateShort(item.date),
    count: Number(item.count || 0),
  }));

  const depositRangeData = depositChart[selectedDepositRange] || [];

  const depositChartData = depositRangeData.map((item) => ({
    rawLabel: selectedDepositRange === "one_year" ? item.month : item.date,
    label:
      selectedDepositRange === "one_year"
        ? formatMonthLabel(item.month)
        : formatDateShort(item.date),
    revenue: Number(item.revenue || 0),
    count: Number(item.transaction_count || 0),
  }));

  const depositTotalRevenue = depositChartData.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
  );

  const revenueRangeTotal = revenueChartData.reduce(
    (sum, item) => sum + (item.revenue || 0),
    0
  );
  const userRangeTotal = userChartData.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const totalSubscriptions = subscriptions.reduce(
    (sum, sub) => sum + Number(sub.count || 0),
    0
  );

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="pt-2 space-y-4 md:space-y-6 pb-4 md:pb-6 px-3 md:px-6 max-w-[1920px] mx-auto">
        {/* Global scrollbar styles */}
        <style>{`
          .scroll-thin-pink::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }
          .scroll-thin-pink::-webkit-scrollbar-track {
            background: transparent;
          }
          .scroll-thin-pink::-webkit-scrollbar-thumb {
            background: #db2777;
            border-radius: 9999px;
          }
          .scroll-thin-pink::-webkit-scrollbar-thumb:hover {
            background: #be185d;
          }
          .scroll-thin-pink {
            scrollbar-width: thin;
            scrollbar-color: #db2777 transparent;
          }
          
          /* Hide horizontal scrollbar globally */
          body {
            overflow-x: hidden;
          }
          
          /* Ensure content doesn't cause horizontal overflow */
          .dashboard-container {
            max-width: 100vw;
            overflow-x: hidden;
          }
        `}</style>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              className={`text-lg md:text-xl lg:text-2xl font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                }`}
            >
              Admin Dashboard
            </h2>
            <p
              className={`text-xs md:text-sm transition-colors truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                }`}
            >
              Real-time insights for users, companies, subscriptions & revenue.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className={`self-start md:self-auto px-3 md:px-4 py-1.5 md:py-2 rounded-full border text-xs md:text-sm hover:transition flex items-center gap-2 transition-colors flex-shrink-0 mt-2 md:mt-0 ${isDarkMode
              ? "bg-pink-900/20 border-pink-700/50 text-pink-300 hover:bg-pink-900/30"
              : "bg-pink-100 border-pink-300 text-pink-900 hover:bg-pink-200"
              }`}
          >
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="hidden sm:inline">Refresh data</span>
            <span className="sm:hidden">Refresh</span>
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="w-full flex justify-center py-12 md:py-20">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`h-8 w-8 border-2 border-t-transparent rounded-full animate-spin transition-colors ${isDarkMode ? "border-pink-400" : "border-pink-600"
                  }`}
              />
              <p
                className={`text-sm transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-400"
                  }`}
              >
                Loading dashboard…
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            className={`p-3 md:p-4 border rounded-2xl text-sm flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${isDarkMode
              ? "bg-red-900/20 text-red-400 border-red-700/50"
              : "bg-red-50 text-red-700 border-red-200"
              }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Error</p>
              <p className="mt-1 text-xs md:text-sm truncate">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="text-xs md:text-sm underline self-start sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && !error && (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              <StatCard
                label="Total Users"
                value={totals.users}
                icon={FaUsers}
                highlight
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Companies"
                value={totals.companies}
                icon={FaBuilding}
                isDarkMode={isDarkMode}
              />
              <div className="col-span-2 lg:col-span-1">
                <StatCard
                  label="Paid Subscribers"
                  value={totals.paid_subscribers}
                  icon={FaCheckCircle}
                  isDarkMode={isDarkMode}
                />
              </div>
              <StatCard
                label="Requests"
                value={totals.requests}
                icon={FaClipboardList}
                isDarkMode={isDarkMode}
              />
              <div className="col-span-2 lg:col-span-1">
                <StatCard
                  label="Payment Transactions"
                  value={totals.total_payment_transactions}
                  icon={FaMoneyBillWave}
                  highlight
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <MetricCard
                title="Total Revenue"
                value={revenue.total}
                badge="All Time"
                isDarkMode={isDarkMode}
              />
              <MetricCard
                title="Deposit Revenue"
                value={revenue.deposit_revenue}
                badge="Deposits"
                isDarkMode={isDarkMode}
              />
              <MetricCard
                title="Pending Revenue"
                value={revenue.pending}
                badge="Pending"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Revenue Chart */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-3 md:gap-4 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm md:text-base font-semibold truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                        }`}
                    >
                      Revenue Trend
                    </h3>
                    <p
                      className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      Subscription revenue over selected period.
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <RangeTabs
                      value={selectedRevenueRange}
                      onChange={setSelectedRevenueRange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                <div className="h-48 sm:h-56 md:h-64 w-full">
                  {revenueChartData.length === 0 ? (
                    <div
                      className={`h-full flex items-center justify-center text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                    >
                      No revenue data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueChartData}
                        margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="revGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#be185d"
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor="#be185d"
                              stopOpacity={0.15}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke={isDarkMode ? "#475569" : "#f9e3f1"}
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <Tooltip
                          content={<RevenueTooltip isDarkMode={isDarkMode} />}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#be185d"
                          strokeWidth={2}
                          fill="url(#revGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div
                  className={`mt-1 flex items-center justify-between text-[11px] md:text-xs border-t pt-2 md:pt-3 ${isDarkMode
                    ? "text-slate-400 border-slate-700"
                    : "text-gray-500 border-gray-100"
                    }`}
                >
                  <span>Total in range</span>
                  <span
                    className={`font-medium truncate ml-2 ${isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                  >
                    ₹{revenueRangeTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* User Growth */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-3 md:gap-4 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm md:text-base font-semibold truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                        }`}
                    >
                      User Growth
                    </h3>
                    <p
                      className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      New users added in the selected period.
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <RangeTabs
                      value={selectedUserRange}
                      onChange={setSelectedUserRange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                <div className="h-48 sm:h-56 md:h-64 w-full">
                  {userChartData.length === 0 ? (
                    <div
                      className={`h-full flex items-center justify-center text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                    >
                      No user data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart
                        data={userChartData}
                        margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="userGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#7c3aed"
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor="#db2777"
                              stopOpacity={0.85}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke={isDarkMode ? "#475569" : "#e0e7ff"}
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <Tooltip
                          content={<UsersTooltip isDarkMode={isDarkMode} />}
                        />
                        <Bar
                          dataKey="count"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                          fill="url(#userGradient)"
                        />
                      </ReBarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div
                  className={`mt-1 flex items-center justify-between text-[11px] md:text-xs border-t pt-2 md:pt-3 ${isDarkMode
                    ? "text-slate-400 border-slate-700"
                    : "text-gray-500 border-gray-100"
                    }`}
                >
                  <span>Total new users in range</span>
                  <span
                    className={`font-medium truncate ml-2 ${isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                  >
                    {userRangeTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* FULL-WIDTH DEPOSIT REVENUE TREND */}
            <div className="mt-4 md:mt-6">
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 flex flex-col gap-3 md:gap-4 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm md:text-base font-semibold truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                        }`}
                    >
                      Deposit Revenue Trend
                    </h3>
                    <p
                      className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      Daily / Monthly 10% deposit collections.
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <RangeTabs
                      value={selectedDepositRange}
                      onChange={setSelectedDepositRange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </div>

                <div className="h-48 sm:h-56 md:h-64 w-full">
                  {depositChartData.length === 0 ? (
                    <div
                      className={`h-full flex items-center justify-center text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                        }`}
                    >
                      No deposit data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={depositChartData}
                        margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="depositGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#7c3aed"
                              stopOpacity={0.95}
                            />
                            <stop
                              offset="100%"
                              stopColor="#db2777"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          stroke={isDarkMode ? "#475569" : "#f3e8ff"}
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <YAxis
                          tick={{
                            fontSize: 10,
                            fill: isDarkMode ? "#94a3b8" : "#6b7280",
                          }}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                          tickLine={false}
                          axisLine={{
                            stroke: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        />
                        <Tooltip
                          content={<RevenueTooltip isDarkMode={isDarkMode} />}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#7c3aed"
                          strokeWidth={2}
                          fill="url(#depositGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div
                  className={`mt-1 flex items-center justify-between text-[11px] md:text-xs border-t pt-2 md:pt-3 ${isDarkMode
                    ? "text-slate-400 border-slate-700"
                    : "text-gray-500 border-gray-100"
                    }`}
                >
                  <span>Total Deposit Revenue</span>
                  <span
                    className={`font-medium truncate ml-2 ${isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                  >
                    ₹{depositTotalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION BREAKDOWN */}
            <div
              className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-6 mt-4 transition-colors ${isDarkMode
                ? "bg-slate-800/90 border-slate-700"
                : "bg-white/90 border-pink-200"
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Subscription Breakdown
                  </h3>
                  <p
                    className={`text-xs transition-colors truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    Distribution of active subscription plans.
                  </p>
                </div>
                {totalSubscriptions > 0 && (
                  <span
                    className={`text-[11px] md:text-xs transition-colors mt-2 sm:mt-0 ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    Total:{" "}
                    <span
                      className={`font-medium transition-colors ${isDarkMode ? "text-slate-100" : "text-gray-900"
                        }`}
                    >
                      {totalSubscriptions}
                    </span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {subscriptions.length === 0 && (
                  <p
                    className={`text-xs transition-colors col-span-full ${isDarkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                  >
                    No subscription data available.
                  </p>
                )}

                {subscriptions.map((sub) => {
                  const count = Number(sub.count || 0);
                  const percent =
                    totalSubscriptions > 0
                      ? Math.round((count / totalSubscriptions) * 100)
                      : 0;

                  return (
                    <div
                      key={sub.subscription_plan}
                      className={`backdrop-blur border rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all ${isDarkMode
                        ? "bg-slate-800/80 border-slate-700"
                        : "bg-white/80 border-pink-200"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[11px] transition-colors truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                          >
                            {sub.subscription_plan}
                          </p>
                          <p
                            className={`text-lg md:text-xl font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-900"
                              }`}
                          >
                            {count}
                          </p>
                        </div>
                        <div
                          className={`h-8 w-8 md:h-10 md:w-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm ml-3 transition-colors ${isDarkMode
                            ? "bg-pink-900/30 text-pink-400"
                            : "bg-pink-200 text-pink-900"
                            }`}
                        >
                          {sub.subscription_plan?.[0] || "-"}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div
                          className={`w-full h-1.5 rounded-full overflow-hidden transition-colors ${isDarkMode ? "bg-slate-700" : "bg-pink-100"
                            }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-pink-700 to-pink-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p
                          className={`text-[10px] mt-1 transition-colors truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
                          {percent}% of active subscriptions
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
              {/* Recent Users */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Recent Users
                  </h3>
                  <span
                    className={`text-[11px] md:text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {recent.users?.length || 0} records
                  </span>
                </div>

                <div
                  className={`overflow-x-auto scroll-thin-pink rounded-xl border transition-colors ${isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                >
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead
                      className={`transition-colors ${isDarkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-pink-100/80 text-gray-700"
                        }`}
                    >
                      <tr>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Name</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden sm:table-cell">
                          Email
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Role</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recent.users || []).slice(0, 10).map((u, idx) => (
                        <tr
                          key={u.name}
                          className={`border-t transition-colors ${idx % 2 === 1
                            ? isDarkMode
                              ? "bg-slate-700/30"
                              : "bg-gray-50/60"
                            : ""
                            } ${isDarkMode
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-pink-50/80"
                            }`}
                          style={{
                            borderColor: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        >
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 font-medium transition-colors truncate max-w-[70px] sm:max-w-[90px] ${isDarkMode ? "text-slate-100" : "text-gray-900"
                              }`}
                          >
                            {u.full_name || "-"}
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden sm:table-cell transition-colors truncate max-w-[100px] ${isDarkMode ? "text-slate-300" : "text-gray-700"
                              }`}
                          >
                            {u.email || "-"}
                          </td>
                          <td className="py-1.5 px-1.5 sm:px-2">
                            <span
                              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[60px] sm:max-w-[80px] ${isDarkMode
                                ? "bg-pink-900/30 text-pink-300"
                                : "bg-pink-100 text-pink-800"
                                }`}
                            >
                              {u.role || "-"}
                            </span>
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden lg:table-cell transition-colors truncate text-[9px] sm:text-[10px] ${isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                          >
                            {formatDateTime(u.creation)}
                          </td>
                        </tr>
                      ))}
                      {(recent.users || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className={`py-4 px-2 text-center text-xs transition-colors ${isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            No recent users.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Companies */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Recent Companies
                  </h3>
                  <span
                    className={`text-[11px] md:text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {recent.companies?.length || 0} records
                  </span>
                </div>

                <div
                  className={`overflow-x-auto scroll-thin-pink rounded-xl border transition-colors ${isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                >
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead
                      className={`transition-colors ${isDarkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-pink-100/80 text-gray-700"
                        }`}
                    >
                      <tr>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Company</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden sm:table-cell">
                          Manager
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Plan</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recent.companies || []).slice(0, 10).map((c, idx) => (
                        <tr
                          key={c.name}
                          className={`border-t transition-colors ${idx % 2 === 1
                            ? isDarkMode
                              ? "bg-slate-700/30"
                              : "bg-gray-50/60"
                            : ""
                            } ${isDarkMode
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-pink-50/80"
                            }`}
                          style={{
                            borderColor: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        >
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 font-medium transition-colors truncate max-w-[70px] sm:max-w-[90px] ${isDarkMode ? "text-slate-100" : "text-gray-900"
                              }`}
                          >
                            {c.company_name || "-"}
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden sm:table-cell transition-colors truncate max-w-[100px] ${isDarkMode ? "text-slate-300" : "text-gray-700"
                              }`}
                          >
                            {c.manager_email || "-"}
                          </td>
                          <td className="py-1.5 px-1.5 sm:px-2">
                            <span
                              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[60px] sm:max-w-[80px] ${isDarkMode
                                ? "bg-pink-900/30 text-pink-300"
                                : "bg-pink-100 text-pink-800"
                                }`}
                            >
                              {c.subscription_plan || "-"}
                            </span>
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden lg:table-cell transition-colors truncate text-[9px] sm:text-[10px] ${isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                          >
                            {formatDateTime(c.created_at)}
                          </td>
                        </tr>
                      ))}
                      {(recent.companies || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className={`py-4 px-2 text-center text-xs transition-colors ${isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            No recent companies.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Payments */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Recent Payments
                  </h3>
                  <span
                    className={`text-[11px] md:text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {recent.payments?.length || 0} records
                  </span>
                </div>

                <div
                  className={`overflow-x-auto scroll-thin-pink rounded-xl border transition-colors ${isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                >
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead
                      className={`transition-colors ${isDarkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-pink-100/80 text-gray-700"
                        }`}
                    >
                      <tr>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">ID</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden sm:table-cell">
                          Company
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Amount</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Plan
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recent.payments || []).slice(0, 10).map((p, idx) => {
                        const amt = Number(p.amount || 0);
                        return (
                          <tr
                            key={p.name}
                            className={`border-t transition-colors ${idx % 2 === 1
                              ? isDarkMode
                                ? "bg-slate-700/30"
                                : "bg-gray-50/60"
                              : ""
                              } ${isDarkMode
                                ? "hover:bg-slate-700/50"
                                : "hover:bg-pink-50/80"
                              }`}
                            style={{
                              borderColor: isDarkMode ? "#475569" : "#e5e7eb",
                            }}
                          >
                            <td
                              className={`py-1.5 px-1.5 sm:px-2 font-medium transition-colors truncate max-w-[60px] sm:max-w-[70px] ${isDarkMode ? "text-slate-100" : "text-gray-900"
                                }`}
                            >
                              {p.name}
                            </td>
                            <td
                              className={`py-1.5 px-1.5 sm:px-2 hidden sm:table-cell transition-colors truncate max-w-[80px] ${isDarkMode ? "text-slate-300" : "text-gray-700"
                                }`}
                            >
                              {p.company_name || "-"}
                            </td>
                            <td
                              className={`py-1.5 px-1.5 sm:px-2 font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-900"
                                }`}
                            >
                              ₹{amt.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 px-1.5 sm:px-2 hidden lg:table-cell">
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[60px] sm:max-w-[70px] ${isDarkMode
                                  ? "bg-pink-900/30 text-pink-300"
                                  : "bg-pink-100 text-pink-800"
                                  }`}
                              >
                                {p.subscription_plan || "-"}
                              </span>
                            </td>
                            <td className="py-1.5 px-1.5 sm:px-2">
                              <span
                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[55px] sm:max-w-[70px] ${p.payment_status === "Paid"
                                  ? isDarkMode
                                    ? "bg-green-900/30 text-green-300"
                                    : "bg-green-50 text-green-700"
                                  : isDarkMode
                                    ? "bg-yellow-900/30 text-yellow-300"
                                    : "bg-yellow-50 text-yellow-700"
                                  }`}
                              >
                                {p.payment_status || "-"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {(recent.payments || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className={`py-4 px-2 text-center text-xs transition-colors ${isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            No recent payments.
                          </td>
                        </tr>
                      )}\r\n                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Request Payments */}
              <div
                className={`backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Recent Request Payments
                  </h3>

                  <span
                    className={`text-[11px] md:text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {recent.request_payments?.length || 0} records
                  </span>
                </div>

                <div
                  className={`overflow-x-auto scroll-thin-pink rounded-xl border transition-colors ${isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                >
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead
                      className={`transition-colors ${isDarkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-pink-100/80 text-gray-700"
                        }`}
                    >
                      <tr>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">ID</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden sm:table-cell">
                          Company
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Total</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Deposit
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Balance
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(recent.request_payments || [])
                        .slice(0, 10)
                        .map((p, idx) => {
                          const total = Number(p.total_amount || 0);
                          const deposit = Number(p.deposit_amount || 0);
                          const balance = Number(p.remaining_amount || 0);

                          return (
                            <tr
                              key={p.name}
                              className={`border-t transition-colors ${idx % 2 === 1
                                ? isDarkMode
                                  ? "bg-slate-700/30"
                                  : "bg-gray-50/60"
                                : ""
                                } ${isDarkMode
                                  ? "hover:bg-slate-700/50"
                                  : "hover:bg-pink-50/80"
                                }`}
                              style={{
                                borderColor: isDarkMode
                                  ? "#475569"
                                  : "#e5e7eb",
                              }}
                            >
                              <td
                                className={`py-1.5 px-1.5 sm:px-2 font-medium transition-colors truncate max-w-[60px] sm:max-w-[70px] ${isDarkMode
                                  ? "text-slate-100"
                                  : "text-gray-900"
                                  }`}
                              >
                                {p.name}
                              </td>

                              <td
                                className={`py-1.5 px-1.5 sm:px-2 hidden sm:table-cell transition-colors truncate max-w-[70px] ${isDarkMode
                                  ? "text-slate-300"
                                  : "text-gray-700"
                                  }`}
                              >
                                {p.company_name || "-"}
                              </td>

                              <td
                                className={`py-1.5 px-1.5 sm:px-2 font-semibold transition-colors truncate ${isDarkMode
                                  ? "text-slate-100"
                                  : "text-gray-900"
                                  }`}
                              >
                                ₹{total.toLocaleString("en-IN")}
                              </td>

                              <td
                                className={`py-1.5 px-1.5 sm:px-2 hidden lg:table-cell transition-colors truncate text-[9px] sm:text-[10px] ${isDarkMode
                                  ? "text-slate-300"
                                  : "text-gray-700"
                                  }`}
                              >
                                ₹{deposit.toLocaleString("en-IN")}
                              </td>

                              <td
                                className={`py-1.5 px-1.5 sm:px-2 hidden lg:table-cell transition-colors truncate text-[9px] sm:text-[10px] ${isDarkMode
                                  ? "text-slate-300"
                                  : "text-gray-700"
                                  }`}
                              >
                                ₹{balance.toLocaleString("en-IN")}
                              </td>

                              <td className="py-1.5 px-1.5 sm:px-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[55px] sm:max-w-[70px] ${p.payment_status === "Paid"
                                    ? isDarkMode
                                      ? "bg-green-900/30 text-green-300"
                                      : "bg-green-50 text-green-700"
                                    : isDarkMode
                                      ? "bg-yellow-900/30 text-yellow-300"
                                      : "bg-yellow-50 text-yellow-700"
                                    }`}
                                >
                                  {p.payment_status || "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                      {(recent.request_payments || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className={`py-4 px-2 text-center text-xs transition-colors ${isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            No recent request payments.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Requests */}
              <div
                className={`lg:col-span-2 backdrop-blur-md border shadow-md rounded-2xl p-3 md:p-4 lg:p-5 transition-colors ${isDarkMode
                  ? "bg-slate-800/90 border-slate-700"
                  : "bg-white/90 border-pink-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <h3
                    className={`text-sm md:text-base font-semibold transition-colors truncate ${isDarkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                  >
                    Recent Requests
                  </h3>
                  <span
                    className={`text-[11px] md:text-xs transition-colors ${isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {recent.requests?.length || 0} records
                  </span>
                </div>

                <div
                  className={`overflow-x-auto scroll-thin-pink rounded-xl border transition-colors ${isDarkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                >
                  <table className="w-full text-[10px] sm:text-xs">
                    <thead
                      className={`transition-colors ${isDarkMode
                        ? "bg-slate-700/50 text-slate-200"
                        : "bg-pink-100/80 text-gray-700"
                        }`}
                    >
                      <tr>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">ID</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden sm:table-cell">
                          User
                        </th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Route</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left">Status</th>
                        <th className="py-1.5 px-1.5 sm:px-2 text-left hidden lg:table-cell">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(recent.requests || []).slice(0, 10).map((r, idx) => (
                        <tr
                          key={r.name}
                          className={`border-t transition-colors ${idx % 2 === 1
                            ? isDarkMode
                              ? "bg-slate-700/30"
                              : "bg-gray-50/60"
                            : ""
                            } ${isDarkMode
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-pink-50/80"
                            }`}
                          style={{
                            borderColor: isDarkMode ? "#475569" : "#e5e7eb",
                          }}
                        >
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 font-medium transition-colors truncate max-w-[60px] sm:max-w-[70px] ${isDarkMode ? "text-slate-100" : "text-gray-900"
                              }`}
                          >
                            {r.name}
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden sm:table-cell transition-colors truncate max-w-[80px] ${isDarkMode ? "text-slate-300" : "text-gray-700"
                              }`}
                          >
                            {r.user_email || "-"}
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 transition-colors truncate max-w-[90px] sm:max-w-[110px] ${isDarkMode ? "text-slate-200" : "text-gray-800"
                              }`}
                          >
                            {r.pickup_city || "-"} → {r.delivery_city || "-"}
                          </td>
                          <td className="py-1.5 px-1.5 sm:px-2">
                            <span
                              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium transition-colors truncate max-w-[60px] sm:max-w-[75px] ${isDarkMode
                                ? "bg-pink-900/30 text-pink-300"
                                : "bg-pink-100 text-pink-800"
                                }`}
                            >
                              {r.status || "-"}
                            </span>
                          </td>
                          <td
                            className={`py-1.5 px-1.5 sm:px-2 hidden lg:table-cell transition-colors truncate text-[9px] sm:text-[10px] ${isDarkMode ? "text-slate-400" : "text-gray-500"
                              }`}
                          >
                            {formatDateTime(r.created_at)}
                          </td>
                        </tr>
                      ))}
                      {(recent.requests || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className={`py-4 px-2 text-center text-xs transition-colors ${isDarkMode ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            No recent requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;